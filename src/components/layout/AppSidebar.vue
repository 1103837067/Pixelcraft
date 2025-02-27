<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStorage } from '@vueuse/core'
import { useImageStore } from '@/stores/image'
import { ElMessage } from 'element-plus'
import type { ImageConfig } from '@/types/image'

const imageStore = useImageStore()

// 预设尺寸
const sizePresets = [
  { label: '小图 (512px)', value: 512 },
  { label: '中图 (1024px)', value: 1024 },
  { label: '大图 (2048px)', value: 2048 },
  { label: '超大图 (4096px)', value: 4096 }
]

// 预设格式
const formatPresets = [
  { label: 'WebP (推荐)', value: 'webp', recommended: true },
  { label: 'JPEG', value: 'jpg' },
  { label: 'PNG', value: 'png' },
  { label: 'AVIF (实验性)', value: 'avif', experimental: true },
  { label: 'HEIF', value: 'heif', experimental: true },
  { label: 'TIFF', value: 'tiff' },
  { label: 'BMP', value: 'bmp' }
]

// 配置
const config = useStorage<ImageConfig>('pixelcraft-config', {
  sizes: [512, 1024, 2048],
  formats: ['webp', 'jpg'],
  quality: 0.8,
  preserveExif: false
})

// 自定义尺寸
const customSize = ref('')

// 添加自定义尺寸
function handleAddCustomSize() {
  const size = parseInt(customSize.value)
  if (isNaN(size) || size <= 0) {
    ElMessage.warning('请输入有效的尺寸')
    return
  }
  if (!config.value.sizes.includes(size)) {
    config.value.sizes = [...config.value.sizes, size].sort((a, b) => a - b)
  }
  customSize.value = ''
}

// 处理导出
async function handleExport() {
  if (imageStore.images.length === 0) {
    ElMessage.warning('请先添加图片')
    return
  }
  if (config.value.sizes.length === 0) {
    ElMessage.warning('请选择至少一个输出尺寸')
    return
  }
  if (config.value.formats.length === 0) {
    ElMessage.warning('请选择至少一个输出格式')
    return
  }
  await imageStore.processImages(config.value)
}

// 是否可以导出
const canExport = computed(() => 
  imageStore.images.length > 0 && !imageStore.processing
)
</script>

<template>
  <aside class="w-80 h-full flex flex-col" :class="[
    'bg-color-bg',
    'border-color-border'
  ]">
    <!-- 尺寸设置 -->
    <div class="p-4 border-b" :class="[
      'border-color-border'
    ]">
      <h3 class="text-sm font-medium mb-2" :class="[
        'text-color-regular'
      ]">输出尺寸</h3>
      <div class="space-y-2">
        <el-select
          v-model="config.sizes"
          multiple
          collapse-tags
          collapse-tags-tooltip
          class="w-full"
          placeholder="选择输出尺寸"
        >
          <el-option
            v-for="preset in sizePresets"
            :key="preset.value"
            :label="preset.label"
            :value="preset.value"
          />
          <el-option
            v-for="size in config.sizes.filter(s => !sizePresets.some(p => p.value === s))"
            :key="size"
            :label="`${size}px (自定义)`"
            :value="size"
          />
        </el-select>

        <div class="flex gap-2">
          <el-input
            v-model="customSize"
            placeholder="输入尺寸"
            type="number"
            min="1"
            @keyup.enter="handleAddCustomSize"
          >
            <template #append>px</template>
          </el-input>
          <el-button @click="handleAddCustomSize">添加</el-button>
        </div>
      </div>
    </div>

    <!-- 格式设置 -->
    <div class="p-4 border-b" :class="[
      'border-color-border'
    ]">
      <h3 class="text-sm font-medium mb-2" :class="[
        'text-color-regular'
      ]">输出格式</h3>
      <el-select
        v-model="config.formats"
        multiple
        collapse-tags
        collapse-tags-tooltip
        class="w-full"
        placeholder="选择输出格式"
      >
        <el-option
          v-for="preset in formatPresets"
          :key="preset.value"
          :label="preset.label"
          :value="preset.value"
        />
      </el-select>
    </div>

    <!-- 其他设置 -->
    <div class="p-4 border-b" :class="[
      'border-color-border'
    ]">
      <el-checkbox v-model="config.preserveExif">
        保留 EXIF 数据
      </el-checkbox>
    </div>

    <!-- 导出按钮 -->
    <div class="mt-auto p-4">
      <el-button
        type="primary"
        class="w-full"
        :loading="imageStore.processing"
        :disabled="!canExport"
        @click="handleExport"
      >
        {{ imageStore.processing ? '处理中...' : '开始转换' }}
      </el-button>
    </div>
  </aside>
</template>

<style scoped>
:deep(.el-select) {
  width: 100%;
}

.bg-color-bg {
  background-color: var(--el-bg-color);
}

.border-color-border {
  border-color: var(--el-border-color);
}

.text-color-regular {
  color: var(--el-text-color-regular);
}
</style> 