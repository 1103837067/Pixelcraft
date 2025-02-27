import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import App from './App.vue'

// 导入自定义主题样式
import '@/styles/element/index.scss'
// 导入暗色模式样式
// 导入 Tailwind 样式
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

// 配置 Element Plus
app.use(ElementPlus, {
  locale: zhCn,
})

// 使用 pinia
app.use(pinia)

// 挂载应用
app.mount('#app')
