<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'
import { ElButton } from 'element-plus'
import { SunIcon, MoonIcon } from '@heroicons/vue/24/outline'

const themeStore = useThemeStore()
</script>

<template>
  <header class="flex items-center justify-between px-6 py-4 shadow-sm bg-color-bg border-color-border">
    <div class="flex items-center gap-2">
      <h1 class="text-2xl font-bold gradient-text">
        Pixelcraft
      </h1>
      <span class="text-sm text-color-secondary">像素工坊</span>
    </div>
    
    <ElButton
      text
      circle
      @click="themeStore.toggleTheme"
      :title="themeStore.isDark ? '切换到亮色模式' : '切换到暗色模式'"
    >
      <template #default>
        <SunIcon v-if="themeStore.isDark" class="w-5 h-5 text-color-regular" />
        <MoonIcon v-else class="w-5 h-5 text-color-regular" />
      </template>
    </ElButton>
  </header>
</template>

<style scoped>
:deep(.el-button) {
  --el-button-hover-bg-color: var(--el-fill-color-light);
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

.text-color-secondary {
  color: var(--el-text-color-secondary);
}

.gradient-text {
  background: linear-gradient(to right, var(--el-color-primary), var(--el-color-primary-light-3));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
</style> 