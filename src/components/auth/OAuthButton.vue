<template>
  <button
    type="button"
    @click="handleOAuth"
    :disabled="loading"
    class="btn btn-outline border-stone-300 dark:border-stone-700 w-full gap-3 font-semibold rounded-xl py-2.5 h-auto flex items-center justify-center hover:bg-base-200 text-base-content text-xs"
  >
    <span v-if="loading" class="loading loading-spinner loading-xs"></span>
    <img v-else-if="iconSrc" :src="iconSrc" alt="" class="h-4 w-4 flex-shrink-0" aria-hidden="true" />
    <span>{{ loading ? `Connecting to ${providerName}...` : label }}</span>
  </button>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth'

const props = defineProps({
  provider: {
    type: String,
    default: 'google',
  },
  providerName: {
    type: String,
    default: 'Google',
  },
  label: {
    type: String,
    default: 'Continue with Google',
  },
  iconSrc: {
    type: String,
    default: '/svg/google.svg',
  },
})

const emit = defineEmits(['success', 'error'])
const authStore = useAuthStore()
const loading = ref(false)

async function handleOAuth() {
  loading.value = true
  try {
    const authData = await authStore.loginWithProvider(props.provider)
    emit('success', authData)
  } catch (err) {
    console.error(`${props.providerName} OAuth error:`, err)
    emit('error', err?.message || `${props.providerName} authentication failed or was canceled.`)
  } finally {
    loading.value = false
  }
}
</script>
