// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest'

const mockPb = {
  authStore: {
    isValid: false,
  },
}

vi.mock('../src/services/pbClient', () => ({
  pb: mockPb,
}))

const { router } = await import('../src/router/index.js')

describe('Router', () => {
  beforeEach(async () => {
    mockPb.authStore.isValid = false
    document.title = ''
    window.scrollTo = vi.fn()
    await router.push('/')
    await router.isReady()
  })

  it('redirects unauthenticated users from protected routes to login with redirect query', async () => {
    await router.push('/account')
    expect(router.currentRoute.value.name).toBe('login')
    expect(router.currentRoute.value.query.redirect).toBe('/account')
  })

  it('allows authenticated users to access protected routes', async () => {
    mockPb.authStore.isValid = true
    await router.push('/profile')

    expect(router.currentRoute.value.name).toBe('profile')
    expect(document.title).toBe('Profile Settings | Pocket Commerce')
  })

  it('redirects legacy /product/:slug path to /shop/card/:slug', async () => {
    await router.push('/product/birthday-cat')

    expect(router.currentRoute.value.name).toBe('product-detail')
    expect(router.currentRoute.value.params.slug).toBe('birthday-cat')
  })

  it('updates document.title in afterEach', async () => {
    await router.push('/shop')
    expect(document.title).toBe('Shop All Cards | Pocket Commerce')
  })
})
