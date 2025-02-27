<script setup lang="ts">
import { computed } from 'vue'
import { ElDialog, ElTable, ElTableColumn, ElTag } from 'element-plus'
import type { ExportResult } from '@/types/image'

const props = defineProps<{
  modelValue: boolean
  result: ExportResult | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const visible = computed({
  get: () => props.result !== null && props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const hasSkippedExports = computed(() => 
  props.result?.skippedExports.length ?? 0 > 0
)
</script>

<template>
  <ElDialog
    v-model="visible"
    title="导出结果"
    width="600px"
    :close-on-click-modal="true"
    destroy-on-close
  >
    <template v-if="result">
      <div class="space-y-4">
        <div class="text-color-regular">
          <p>共处理 {{ result.totalFiles }} 个文件，生成 {{ result.totalExports }} 个导出文件。</p>
          <template v-if="hasSkippedExports">
            <p class="mt-2 text-color-warning">
              以下文件因尺寸超出原图大小而未导出部分尺寸：
            </p>
          </template>
        </div>

        <ElTable
          v-if="hasSkippedExports"
          :data="result.skippedExports"
          style="width: 100%"
          size="small"
          border
        >
          <ElTableColumn prop="fileName" label="文件名" min-width="120" show-overflow-tooltip />
          <ElTableColumn prop="originalSize" label="原始尺寸" width="100" align="center" />
          <ElTableColumn label="未导出尺寸" min-width="120">
            <template #default="{ row }">
              <div class="flex flex-wrap gap-1">
                <ElTag
                  v-for="size in row.skippedSizes"
                  :key="size"
                  type="warning"
                  effect="light"
                  size="small"
                >
                  {{ size }}px
                </ElTag>
              </div>
            </template>
          </ElTableColumn>
        </ElTable>

        <div v-if="hasSkippedExports" class="text-sm text-color-secondary">
          提示：为保证图片质量，我们不会放大图片。如需更大尺寸，请使用更高分辨率的原图。
        </div>
      </div>
    </template>
  </ElDialog>
</template>

<style scoped>
.text-color-regular {
  color: var(--el-text-color-regular);
}

.text-color-secondary {
  color: var(--el-text-color-secondary);
}

.text-color-warning {
  color: var(--el-color-warning);
}
</style> 