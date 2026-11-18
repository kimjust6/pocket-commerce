import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useToastStore } from '../src/stores/toast.js'

describe('Toast Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('adds info, success, and error toasts and removes them manually', () => {
    const toast = useToastStore()

    toast.show('Heads up')
    toast.success('Saved!')
    toast.error('Failed!')

    expect(toast.toasts.length).toBe(3)
    expect(toast.toasts.map((t) => ({ message: t.message, type: t.type }))).toEqual([
      { message: 'Heads up', type: 'info' },
      { message: 'Saved!', type: 'success' },
      { message: 'Failed!', type: 'error' },
    ])

    toast.remove(toast.toasts[1].id)
    expect(toast.toasts.map((t) => t.message)).toEqual(['Heads up', 'Failed!'])
  })

  it('auto-dismisses toasts after timeout', () => {
    const toast = useToastStore()
    toast.show('Temporary', 'info', 2000)

    expect(toast.toasts.length).toBe(1)
    vi.advanceTimersByTime(1999)
    expect(toast.toasts.length).toBe(1)

    vi.advanceTimersByTime(1)
    expect(toast.toasts.length).toBe(0)
  })
})

