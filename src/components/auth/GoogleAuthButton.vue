<template>
  <button
    type="button"
    @click="handleGoogleAuth"
    :disabled="loading"
    class="btn btn-outline border-slate-300 dark:border-slate-700 w-full gap-3 font-semibold rounded-xl py-2.5 h-auto flex items-center justify-center hover:bg-base-200 text-base-content text-xs"
  >
    <span v-if="loading" class="loading loading-spinner loading-xs"></span>
    <img v-else src="/svg/google.svg" alt="" class="h-4 w-4 flex-shrink-0" aria-hidden="true" />
    <span>{{ loading ? 'Connecting to Google...' : label }}</span>
  </button>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth'

defineProps({
  label: {
    type: String,
    default: 'Continue with Google',
  },
})

const emit = defineEmits(['success', 'error'])
const authStore = useAuthStore()
const loading = ref(false)

async function handleGoogleAuth() {
  loading.value = true
  try {
    const authData = await authStore.loginWithGoogle()
    emit('success', authData)
  } catch (err) {
    console.error('Google OAuth error:', err)
    emit('error', err?.message || 'Google authentication failed or was canceled.')
  } finally {
    loading.value = false
  }
}
</script>

