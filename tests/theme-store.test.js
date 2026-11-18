// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useThemeStore } from '../src/stores/theme.js'

describe('Theme Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const storage = {
      _data: {},
      getItem(key) { return this._data[key] ?? null },
      setItem(key, val) { this._data[key] = String(val) },
      removeItem(key) { delete this._data[key] },
      clear() { this._data = {} },
    }
    globalThis.localStorage = storage
    window.localStorage = storage
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.classList.remove('dark')
  })

  it('initializes from localStorage and defaults to light', () => {
    const theme = useThemeStore()
    expect(theme.currentTheme).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('reads stored dark theme from localStorage on init', () => {
    localStorage.setItem('pocket_theme', 'dark')
    const theme = useThemeStore()

    expect(theme.currentTheme).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('toggles between light and dark and persists to localStorage', () => {
    const theme = useThemeStore()

    theme.toggleTheme()
    expect(theme.currentTheme).toBe('dark')
    expect(localStorage.getItem('pocket_theme')).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    theme.toggleTheme()
    expect(theme.currentTheme).toBe('light')
    expect(localStorage.getItem('pocket_theme')).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
