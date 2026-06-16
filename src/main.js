import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import './styles/variables.css'
import './styles/global.css'
import './styles/responsive.css'

const app = createApp(App)
const pinia = createPinia()

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

const themeModes = ['system', 'light', 'dark']
const storedTheme = localStorage.getItem('lostlink-theme-mode') || 'system'
const safeTheme = themeModes.includes(storedTheme) ? storedTheme : 'system'
const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
const resolvedTheme = safeTheme === 'system' ? (prefersDark ? 'dark' : 'light') : safeTheme
document.documentElement.dataset.theme = resolvedTheme
document.documentElement.style.colorScheme = resolvedTheme

app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.mount('#app')
