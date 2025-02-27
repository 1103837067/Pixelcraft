<script setup lang="ts">
import { computed } from 'vue'
import { useImageStore } from '@/stores/image'
import { ElButton, ElProgress, ElTag } from 'element-plus'
import { TrashIcon } from '@heroicons/vue/24/outline'
import { formatFileSize } from '@/utils/format'

const imageStore = useImageStore()

const previewUrls = computed(() => {
  return imageStore.images.map(file => URL.createObjectURL(file))
})

const getProcessedImages = (index: number) => {
  return imageStore.processedImages.filter(
    img => img.originalIndex === index
  )
}

const formatProgress = (percentage: number) => percentage + '%'
</script>

<template>
  <div v-if="imageStore.images.length > 0" class="mt-6 space-y-4">
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
        已选择 {{ imageStore.images.length }} 张图片
      </h3>
      <ElButton
        type="danger"
        text
        @click="imageStore.clearImages"
      >
        清空
      </ElButton>
    </div>
    
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <div
        v-for="(url, index) in previewUrls"
        :key="url"
        class="relative group"
      >
        <div class="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img
            :src="url"
            class="w-full h-full object-cover"
            :alt="imageStore.images[index].name"
          >
        </div>
        
        <!-- 处理状态 -->
        <div 
          v-if="imageStore.processing"
          class="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center"
        >
          <ElProgress
            type="circle"
            :percentage="imageStore.progress"
            :format="formatProgress"
            :width="60"
            class="!text-white"
          />
        </div>

        <!-- 处理结果 -->
        <div 
          v-else-if="getProcessedImages(index).length > 0"
          class="absolute bottom-0 inset-x-0 p-2 bg-black/50 rounded-b-lg"
        >
          <div class="flex flex-wrap gap-1">
            <ElTag
              v-for="(result, i) in getProcessedImages(index)"
              :key="i"
              :type="result.error ? 'danger' : 'success'"
              size="small"
            >
              {{ result.format.toUpperCase() }} {{ formatFileSize(result.size) }}
            </ElTag>
          </div>
        </div>

        <ElButton
          type="danger"
          circle
          class="!absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity !p-2"
          @click="imageStore.removeImage(index)"
        >
          <TrashIcon class="w-4 h-4" />
        </ElButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.el-button.is-text) {
  padding: 0;
}

:deep(.el-progress__text) {
  color: white !important;
}
</style> 