import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useStorage } from '@vueuse/core'
import type { ImageConfig, SizePreset, FormatPreset, QualityPreset, UserConfig } from '@/types/image'

export const useConfigStore = defineStore('config', () => {
  // 预设尺寸
  const sizePresets = ref<SizePreset[]>([
    { label: '小图', value: 512 },
    { label: '中图', value: 1024 },
    { label: '大图', value: 2048 },
    { label: '超大图', value: 4096 }
  ])

  // 预设格式
  const formatPresets = ref<FormatPreset[]>([
    { label: 'WebP', value: 'webp', recommended: true },
    { label: 'JPEG', value: 'jpg' },
    { label: 'PNG', value: 'png' },
    { label: 'AVIF', value: 'avif', experimental: true }
  ])

  // 预设质量
  const qualityPresets = ref<QualityPreset[]>([
    { label: '低质量', value: 0.6, description: '更小体积' },
    { label: '中等质量', value: 0.8, description: '推荐' },
    { label: '高质量', value: 0.9, description: '较大体积' },
    { label: '最佳质量', value: 1, description: '原图质量' }
  ])

  // 用户配置
  const userConfigs = useStorage<UserConfig[]>('pixelcraft-configs', [
    {
      name: '默认配置',
      timestamp: Date.now(),
      sizes: [512, 1024, 2048],
      formats: ['webp', 'jpg'],
      quality: 0.8,
      preserveExif: false,
      customSizes: []
    }
  ])

  // 当前选中的配置
  const currentConfigIndex = useStorage<number>('pixelcraft-current-config', 0)

  // 当前配置
  const currentConfig = computed<ImageConfig>(() => {
    const config = userConfigs.value[currentConfigIndex.value]
    return {
      sizes: [...config.sizes, ...config.customSizes].sort((a, b) => a - b),
      formats: config.formats,
      quality: config.quality,
      preserveExif: config.preserveExif
    }
  })

  // 添加自定义尺寸
  function addCustomSize(size: number) {
    const config = userConfigs.value[currentConfigIndex.value]
    if (!config.customSizes.includes(size)) {
      config.customSizes.push(size)
      config.customSizes.sort((a, b) => a - b)
      userConfigs.value = [...userConfigs.value]
    }
  }

  // 移除自定义尺寸
  function removeCustomSize(size: number) {
    const config = userConfigs.value[currentConfigIndex.value]
    const index = config.customSizes.indexOf(size)
    if (index > -1) {
      config.customSizes.splice(index, 1)
      userConfigs.value = [...userConfigs.value]
    }
  }

  // 保存当前配置
  function saveCurrentConfig(name: string) {
    const config = userConfigs.value[currentConfigIndex.value]
    const newConfig: UserConfig = {
      ...config,
      name,
      timestamp: Date.now()
    }
    userConfigs.value = [...userConfigs.value, newConfig]
    currentConfigIndex.value = userConfigs.value.length - 1
  }

  // 删除配置
  function deleteConfig(index: number) {
    if (userConfigs.value.length > 1) {
      userConfigs.value = userConfigs.value.filter((_, i) => i !== index)
      if (currentConfigIndex.value >= userConfigs.value.length) {
        currentConfigIndex.value = userConfigs.value.length - 1
      }
    }
  }

  // 更新当前配置
  function updateCurrentConfig(config: Partial<ImageConfig>) {
    userConfigs.value = userConfigs.value.map((item, index) => 
      index === currentConfigIndex.value
        ? { ...item, ...config }
        : item
    )
  }

  return {
    sizePresets,
    formatPresets,
    qualityPresets,
    userConfigs,
    currentConfigIndex,
    currentConfig,
    addCustomSize,
    removeCustomSize,
    saveCurrentConfig,
    deleteConfig,
    updateCurrentConfig
  }
}) 