export function createStorageAdapter(storage = typeof localStorage !== 'undefined' ? localStorage : null) {
  return {
    getJson(key, fallback = null) {
      if (!storage) return fallback
      const raw = storage.getItem(key)
      if (!raw) return fallback
      try {
        return JSON.parse(raw)
      } catch {
        storage.removeItem(key)
        return fallback
      }
    },
    setJson(key, value) {
      if (!storage) return
      storage.setItem(key, JSON.stringify(value))
    },
    remove(key) {
      if (!storage) return
      storage.removeItem(key)
    },
  }
}
