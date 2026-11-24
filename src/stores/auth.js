import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { pb, getFileUrl } from '../services/pbClient'
import {
  loginWithPassword,
  loginWithOAuth2,
  registerUser,
  updateUserRecord,
} from '../services/authService'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(pb.authStore.model)
  const token = ref(pb.authStore.token)

  const isAuthenticated = computed(() => !!user.value && pb.authStore.isValid)

  const avatarUrl = computed(() => {
    if (!user.value) return ''
    if (user.value.avatar) {
      return getFileUrl(user.value, user.value.avatar)
    }
    return `https://api.dicebear.com/7.x/bottts/svg?seed=${user.value.username || user.value.id}`
  })

  // Listen to PocketBase auth state changes
  pb.authStore.onChange((newToken, newModel) => {
    token.value = newToken
    user.value = newModel
  })

  async function login(emailOrUsername, password) {
    const authData = await loginWithPassword(emailOrUsername, password)
    user.value = authData.record
    token.value = authData.token
    return authData
  }

  async function loginWithGoogle() {
    const authData = await loginWithOAuth2('google')
    user.value = authData.record
    token.value = authData.token
    return authData
  }

  async function register(payload) {
    await registerUser(payload)
    return await login(payload.email, payload.password)
  }

  function logout() {
    pb.authStore.clear()
    user.value = null
    token.value = ''
  }

  async function updateProfile(formData) {
    if (!user.value) throw new Error('Not authenticated')
    const updated = await updateUserRecord(user.value.id, formData)
    user.value = updated
    return updated
  }

  return {
    user,
    token,
    isAuthenticated,
    avatarUrl,
    login,
    loginWithGoogle,
    register,
    logout,
    updateProfile,
  }
})

