import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToastStore } from '../stores/toast'

export function useAuthForm({
  defaultRedirect = '/account',
  useQueryRedirect = false,
  oauthSuccessMessage = 'Signed in with Google!',
} = {}) {
  const router = useRouter()
  const route = useRoute()
  const toastStore = useToastStore()

  const loading = ref(false)
  const errorMessage = ref('')

  function getRedirectTarget() {
    if (useQueryRedirect && route.query.redirect) {
      return route.query.redirect
    }
    return defaultRedirect
  }

  async function submitAuth(action, { successMessage, fallbackError }) {
    errorMessage.value = ''
    loading.value = true
    try {
      await action()
      toastStore.success(successMessage)
      router.push(getRedirectTarget())
    } catch (err) {
      errorMessage.value = typeof fallbackError === 'function' ? fallbackError(err) : fallbackError
    } finally {
      loading.value = false
    }
  }

  function onOAuthSuccess() {
    toastStore.success(oauthSuccessMessage)
    router.push(getRedirectTarget())
  }

  function onOAuthError(msg) {
    errorMessage.value = msg
  }

  return {
    loading,
    errorMessage,
    submitAuth,
    onOAuthSuccess,
    onOAuthError,
  }
}
