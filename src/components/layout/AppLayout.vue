<script setup lang="ts">
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'
</script>

<template>
  <div class="h-screen flex flex-col overflow-hidden bg-color-page">
    <AppHeader />
    <div class="flex-1 flex overflow-hidden">
      <AppSidebar />
      <main class="flex-1 overflow-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.bg-color-page {
  background-color: var(--el-bg-color-page);
}
</style> 