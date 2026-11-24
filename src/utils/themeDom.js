export function applyThemeToDocument(theme, doc = typeof document !== 'undefined' ? document : null) {
  if (!doc?.documentElement) return
  doc.documentElement.setAttribute('data-theme', theme)
  if (theme === 'dark') {
    doc.documentElement.classList.add('dark')
  } else {
    doc.documentElement.classList.remove('dark')
  }
}
