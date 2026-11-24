import PocketBase from 'pocketbase'

// Use environment variable, or fallback to relative/window origin in production or dev proxy
const PB_URL = import.meta.env.VITE_PB_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:8090')

export const pb = new PocketBase(PB_URL)

/**
 * Helper to build PocketBase file URLs
 */
export function getFileUrl(record, filename, queryParams = {}) {
  if (!record || !filename) return ''
  if (filename.startsWith('http://') || filename.startsWith('https://') || filename.startsWith('/')) {
    return filename
  }
  return pb.files.getUrl(record, filename, queryParams)
}
