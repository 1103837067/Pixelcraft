<script setup lang="ts">
import { watch, ref } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useImageStore } from '@/stores/image'
import { useDark } from '@vueuse/core'
import AppLayout from './components/layout/AppLayout.vue'
import ImageUploader from './components/image-converter/ImageUploader.vue'
import ImageList from './components/image-converter/ImageList.vue'
import ExportResultDialog from './components/image-converter/ExportResultDialog.vue'
import './assets/main.css'

const themeStore = useThemeStore()
const imageStore = useImageStore()
const isDark = useDark()
const showExportResult = ref(false)

// 监听主题变化
watch(() => themeStore.isDark, (newValue) => {
  isDark.value = newValue
  document.documentElement.classList.toggle('dark', newValue)
}, { immediate: true })

// 监听导出结果
watch(() => imageStore.exportResult, (result) => {
  if (result) {
    showExportResult.value = true
  }
})
</script>

<template>
  <AppLayout>
    <div class="max-w-5xl mx-auto">
      <ImageUploader />
      <ImageList />
    </div>
  </AppLayout>

  <ExportResultDialog
    v-model="showExportResult"
    :result="imageStore.exportResult"
  />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
