import { defineStore } from 'pinia'
import { listCategories } from '../api/category'
import { mockCategories } from '../utils/mock'
import { isFallbackableError, normalizeCategories } from '../utils/normalize'

const THEME_KEY = 'lostlink-theme-mode'
const themeModes = ['system', 'light', 'dark']

const getSystemTheme = () => {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const applyTheme = (mode) => {
  if (typeof document === 'undefined') return
  const resolved = mode === 'system' ? getSystemTheme() : mode
  document.documentElement.dataset.theme = resolved
  document.documentElement.style.colorScheme = resolved
}

export const useAppStore = defineStore('app', {
  state: () => ({
    categories: [],
    categoriesLoaded: false,
    themeMode: 'system',
  }),
  getters: {
    resolvedTheme: (state) => (state.themeMode === 'system' ? getSystemTheme() : state.themeMode),
    themeLabel: (state) => ({ system: '跟随系统', light: '浅色', dark: '深色' })[state.themeMode] || '跟随系统',
  },
  actions: {
    initTheme() {
      const stored = typeof localStorage === 'undefined' ? '' : localStorage.getItem(THEME_KEY)
      this.themeMode = themeModes.includes(stored) ? stored : 'system'
      applyTheme(this.themeMode)
      if (typeof window !== 'undefined') {
        window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change', () => {
          if (this.themeMode === 'system') applyTheme('system')
        })
      }
    },
    setThemeMode(mode) {
      this.themeMode = themeModes.includes(mode) ? mode : 'system'
      localStorage.setItem(THEME_KEY, this.themeMode)
      applyTheme(this.themeMode)
    },
    async loadCategories() {
      if (this.categoriesLoaded) return this.categories
      try {
        this.categories = normalizeCategories(await listCategories())
      } catch (error) {
        this.categories = isFallbackableError(error) ? normalizeCategories(mockCategories) : []
      }
      this.categoriesLoaded = true
      return this.categories
    },
  },
})
