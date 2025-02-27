import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useStorage } from '@vueuse/core'

export const useThemeStore = defineStore('theme', () => {
  const isDark = useStorage('pixelcraft-theme-dark', ref(false))

  function toggleTheme() {
    isDark.value = !isDark.value
    updateTheme()
  }

  function updateTheme() {
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  // 初始化主题
  updateTheme()

  return {
    isDark,
    toggleTheme
  }
}) 