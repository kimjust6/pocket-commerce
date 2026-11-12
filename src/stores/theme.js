import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const storedTheme = localStorage.getItem('pocket_theme') || 'light'
  const currentTheme = ref(storedTheme)

  function applyTheme(theme) {
    currentTheme.value = theme
    localStorage.setItem('pocket_theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  function toggleTheme() {
    const nextTheme = currentTheme.value === 'dark' ? 'light' : 'dark'
    applyTheme(nextTheme)
  }

  // Initial apply
  applyTheme(currentTheme.value)

  return {
    currentTheme,
    toggleTheme,
    applyTheme,
  }
})

