import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import type { ImageConfig, ProcessedImage, SkippedExport, ExportResult } from '@/types/image'

export const useImageStore = defineStore('image', () => {
  const images = ref<File[]>([])
  const processedImages = ref<ProcessedImage[]>([])
  const processing = ref(false)
  const progress = ref(0)
  const skippedExports = ref<SkippedExport[]>([])
  const exportResult = ref<ExportResult | null>(null)

  function addImages(files: File[]) {
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    images.value.push(...imageFiles)
  }

  function removeImage(index: number) {
    images.value.splice(index, 1)
  }

  function clearImages() {
    images.value = []
    processedImages.value = []
    skippedExports.value = []
    exportResult.value = null
  }

  // 使用 Canvas 处理图片
  async function processWithCanvas(
    img: HTMLImageElement,
    options: {
      width: number
      height: number
      format: string
    }
  ): Promise<Blob> {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('无法创建 Canvas 上下文')

    canvas.width = options.width
    canvas.height = options.height

    // 绘制图片
    ctx.drawImage(img, 0, 0, options.width, options.height)

    // 转换为 Blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('图片转换失败'))
          }
        },
        `image/${options.format}`,
        0.8 // 固定使用 0.8 的质量
      )
    })
  }

  async function processImages(config: ImageConfig) {
    if (images.value.length === 0 || processing.value) return

    processing.value = true
    progress.value = 0
    processedImages.value = []
    skippedExports.value = []
    exportResult.value = null

    try {
      const zip = new JSZip()
      let totalTasks = 0
      let completedTasks = 0
      let totalExports = 0

      // 首先计算实际需要处理的任务数量（排除超过原图尺寸的情况）
      for (const file of images.value) {
        const img = await createImage(file)
        const maxSize = Math.max(img.width, img.height)
        const validSizes = config.sizes.filter(size => size <= maxSize)
        totalTasks += validSizes.length * config.formats.length
      }

      for (const [fileIndex, file] of images.value.entries()) {
        const results: ProcessedImage[] = []
        const img = await createImage(file)
        const fileName = file.name.substring(0, file.name.lastIndexOf('.'))
        const maxSize = Math.max(img.width, img.height)
        
        // 为每个原文件创建一个文件夹
        const fileFolder = zip.folder(fileName)!

        // 收集被跳过的尺寸
        const skippedSizes = config.sizes.filter(size => size > maxSize)
        if (skippedSizes.length > 0) {
          skippedExports.value.push({
            fileName,
            originalSize: `${img.width}x${img.height}`,
            skippedSizes
          })
        }

        // 只处理不超过原图尺寸的配置
        const validSizes = config.sizes.filter(size => size <= maxSize)

        for (const format of config.formats) {
          try {
            // 在原文件文件夹下创建格式文件夹
            const formatFolder = fileFolder.folder(format)!

            for (const size of validSizes) {
              try {
                // 计算目标尺寸
                const { targetWidth, targetHeight } = calculateTargetSize(img, size)

                // 处理图片
                const blob = await processWithCanvas(img, {
                  width: targetWidth,
                  height: targetHeight,
                  format
                })

                const result: ProcessedImage = {
                  url: URL.createObjectURL(blob),
                  size: blob.size,
                  type: blob.type,
                  format,
                  width: targetWidth,
                  height: targetHeight,
                  originalIndex: fileIndex
                }
                results.push(result)
                
                // 添加到对应的格式文件夹中
                const outputName = `${size}px_${targetWidth}x${targetHeight}.${format}`
                formatFolder.file(outputName, blob)
                totalExports++
              } catch (error) {
                console.error('处理图片失败:', error)
                results.push({
                  url: '',
                  size: 0,
                  type: `image/${format}`,
                  format,
                  width: size,
                  height: size,
                  error: error instanceof Error ? error.message : '处理失败',
                  originalIndex: fileIndex
                })
              }
              completedTasks++
              updateProgress(completedTasks, totalTasks)
            }
          } catch (error) {
            console.error('格式转换失败:', error)
            results.push({
              url: '',
              size: 0,
              type: `image/${format}`,
              format,
              width: 0,
              height: 0,
              error: error instanceof Error ? error.message : '格式转换失败',
              originalIndex: fileIndex
            })
            completedTasks++
            updateProgress(completedTasks, totalTasks)
          }
        }

        processedImages.value.push(...results)
      }

      // 生成并下载 ZIP 文件
      const blob = await zip.generateAsync({ type: 'blob' })
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      saveAs(blob, `pixelcraft-${timestamp}.zip`)

      // 设置导出结果
      exportResult.value = {
        success: true,
        totalFiles: images.value.length,
        totalExports,
        skippedExports: skippedExports.value
      }

      ElMessage.success('处理完成，开始下载')
    } catch (error) {
      console.error('处理图片时出错:', error)
      ElMessage.error('处理图片时出错')
      exportResult.value = {
        success: false,
        totalFiles: images.value.length,
        totalExports: 0,
        skippedExports: skippedExports.value
      }
    } finally {
      processing.value = false
      progress.value = 0
    }
  }

  // 计算目标尺寸
  function calculateTargetSize(img: HTMLImageElement, maxSize: number) {
    const ratio = img.width / img.height
    let targetWidth: number
    let targetHeight: number

    if (img.width >= img.height) {
      targetWidth = Math.min(maxSize, img.width)
      targetHeight = Math.round(targetWidth / ratio)
    } else {
      targetHeight = Math.min(maxSize, img.height)
      targetWidth = Math.round(targetHeight * ratio)
    }

    return { targetWidth, targetHeight }
  }

  // 创建图片对象
  function createImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('图片加载失败'))
      img.src = URL.createObjectURL(file)
    })
  }

  // 更新进度
  function updateProgress(completed: number, total: number) {
    progress.value = Math.round((completed / total) * 100)
  }

  return {
    images,
    processedImages,
    processing,
    progress,
    skippedExports,
    exportResult,
    addImages,
    removeImage,
    clearImages,
    processImages
  }
})