import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const mockPb = {
  authStore: {
    model: null,
    token: '',
    isValid: false,
    onChange: vi.fn(),
    clear: vi.fn(),
  },
}

const mockGetFileUrl = vi.fn((record, filename) => `/files/${record.id}/${filename}`)
const mockLoginWithPassword = vi.fn()
const mockLoginWithOAuth2 = vi.fn()
const mockRegisterUser = vi.fn()
const mockUpdateUserRecord = vi.fn()

vi.mock('../src/services/pocketbase', () => ({
  pb: mockPb,
  getFileUrl: (...args) => mockGetFileUrl(...args),
  loginWithPassword: (...args) => mockLoginWithPassword(...args),
  loginWithOAuth2: (...args) => mockLoginWithOAuth2(...args),
  registerUser: (...args) => mockRegisterUser(...args),
  updateUserRecord: (...args) => mockUpdateUserRecord(...args),
}))

const { useAuthStore } = await import('../src/stores/auth.js')

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockPb.authStore.model = null
    mockPb.authStore.token = ''
    mockPb.authStore.isValid = false
    vi.clearAllMocks()
  })

  it('computes isAuthenticated and avatarUrl correctly', () => {
    const auth = useAuthStore()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.avatarUrl).toBe('')

    auth.user = { id: 'u1', username: 'alice', avatar: '' }
    mockPb.authStore.isValid = true
    expect(auth.avatarUrl).toBe('https://api.dicebear.com/7.x/bottts/svg?seed=alice')

    auth.user = { id: 'u1', username: 'alice', avatar: 'pic.png' }
    expect(auth.avatarUrl).toBe('/files/u1/pic.png')
    expect(mockGetFileUrl).toHaveBeenCalledWith(auth.user, 'pic.png')
  })

  it('logs in with password and updates user/token', async () => {
    mockLoginWithPassword.mockResolvedValue({
      record: { id: 'u1', email: 'a@b.com' },
      token: 'tok-123',
    })

    const auth = useAuthStore()
    await auth.login('a@b.com', 'secret')

    expect(mockLoginWithPassword).toHaveBeenCalledWith('a@b.com', 'secret')
    expect(auth.user).toEqual({ id: 'u1', email: 'a@b.com' })
    expect(auth.token).toBe('tok-123')
  })

  it('logs in with Google OAuth2', async () => {
    mockLoginWithOAuth2.mockResolvedValue({
      record: { id: 'u2', email: 'g@b.com' },
      token: 'tok-google',
    })

    const auth = useAuthStore()
    await auth.loginWithGoogle()

    expect(mockLoginWithOAuth2).toHaveBeenCalledWith('google')
    expect(auth.user).toEqual({ id: 'u2', email: 'g@b.com' })
    expect(auth.token).toBe('tok-google')
  })

  it('registers a user and logs them in', async () => {
    mockRegisterUser.mockResolvedValue({ id: 'u3' })
    mockLoginWithPassword.mockResolvedValue({
      record: { id: 'u3', email: 'new@b.com' },
      token: 'tok-new',
    })

    const auth = useAuthStore()
    const payload = { email: 'new@b.com', password: 'pw', passwordConfirm: 'pw', name: 'New' }
    await auth.register(payload)

    expect(mockRegisterUser).toHaveBeenCalledWith(payload)
    expect(mockLoginWithPassword).toHaveBeenCalledWith('new@b.com', 'pw')
    expect(auth.token).toBe('tok-new')
  })

  it('logs out and clears auth state', () => {
    const auth = useAuthStore()
    auth.user = { id: 'u1' }
    auth.token = 'tok'

    auth.logout()

    expect(mockPb.authStore.clear).toHaveBeenCalled()
    expect(auth.user).toBeNull()
    expect(auth.token).toBe('')
  })

  it('throws when updating profile while unauthenticated and updates when authenticated', async () => {
    const auth = useAuthStore()
    await expect(auth.updateProfile({ name: 'X' })).rejects.toThrow('Not authenticated')

    auth.user = { id: 'u1', name: 'Old' }
    mockUpdateUserRecord.mockResolvedValue({ id: 'u1', name: 'Updated' })

    const updated = await auth.updateProfile({ name: 'Updated' })
    expect(mockUpdateUserRecord).toHaveBeenCalledWith('u1', { name: 'Updated' })
    expect(updated).toEqual({ id: 'u1', name: 'Updated' })
    expect(auth.user).toEqual({ id: 'u1', name: 'Updated' })
  })
})

