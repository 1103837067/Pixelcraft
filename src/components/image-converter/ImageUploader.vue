<script setup lang="ts">
import { ref } from 'vue'
import { useImageStore } from '@/stores/image'
import { ElMessage } from 'element-plus'
import { CloudArrowUpIcon } from '@heroicons/vue/24/outline'

const imageStore = useImageStore()
const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

// 支持的输入格式
const SUPPORTED_INPUT_FORMATS = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/tiff',
  'image/x-icon',
  'image/svg+xml'
]

function handleDragEnter(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function handleDragLeave(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  
  const files = Array.from(e.dataTransfer?.files || [])
  if (files.length === 0) return
  
  handleFiles(files)
}

function handleFileSelect(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files || [])
  if (files.length === 0) return
  
  handleFiles(files)
}

function handleFiles(files: File[]) {
  const imageFiles = files.filter(file => SUPPORTED_INPUT_FORMATS.includes(file.type))
  
  if (imageFiles.length === 0) {
    ElMessage.warning('请选择支持的图片格式')
    return
  }

  const unsupportedFiles = files.filter(file => !SUPPORTED_INPUT_FORMATS.includes(file.type))
  if (unsupportedFiles.length > 0) {
    ElMessage.warning(`${unsupportedFiles.length} 个文件格式不支持`)
  }
  
  imageStore.addImages(imageFiles)
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<template>
  <div
    class="relative flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg transition-colors cursor-pointer"
    :class="{
      'border-color-border bg-color-page hover:border-color-hover': !isDragging,
      'border-primary bg-primary': isDragging
    }"
    @click="fileInput?.click()"
    @dragenter="handleDragEnter"
    @dragover.prevent
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <input
      ref="fileInput"
      type="file"
      multiple
      :accept="SUPPORTED_INPUT_FORMATS.join(',')"
      class="hidden"
      @change="handleFileSelect"
    >
    
    <CloudArrowUpIcon class="w-8 h-8 mb-2 text-color-secondary" />
    <p class="text-sm text-color-regular">
      拖拽图片到此处或点击上传
    </p>
    <p class="mt-1 text-xs text-color-secondary">
      支持 JPG、PNG、WebP、GIF、BMP、TIFF、ICO、SVG 格式
    </p>
  </div>
</template>

<style scoped>
.bg-color-page {
  background-color: var(--el-bg-color-page);
}

.border-color-border {
  border-color: var(--el-border-color);
}

.border-color-hover {
  border-color: var(--el-color-primary);
}

.border-primary {
  border-color: var(--el-color-primary);
}

.bg-primary {
  background-color: var(--el-color-primary-light-9);
}

.text-color-regular {
  color: var(--el-text-color-regular);
}

.text-color-secondary {
  color: var(--el-text-color-secondary);
}
</style>