import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createStorageAdapter } from '../utils/storage'
import { applyThemeToDocument } from '../utils/themeDom'

const THEME_STORAGE_KEY = 'pocket_theme'

export const useThemeStore = defineStore('theme', () => {
  const storage = createStorageAdapter()
  const storedTheme = (typeof localStorage !== 'undefined' ? localStorage.getItem(THEME_STORAGE_KEY) : null) || 'light'
  const currentTheme = ref(storedTheme)

  function applyTheme(theme) {
    currentTheme.value = theme
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } else {
      storage.setJson(THEME_STORAGE_KEY, theme)
    }
    applyThemeToDocument(theme)
  }

  function toggleTheme() {
    const nextTheme = currentTheme.value === 'dark' ? 'light' : 'dark'
    applyTheme(nextTheme)
  }

  applyTheme(currentTheme.value)

  return {
    currentTheme,
    toggleTheme,
    applyTheme,
  }
})
