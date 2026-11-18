<template>
  <AuthCardLayout
    title="Welcome Back"
    subtitle="Sign in to your Pocket Commerce account"
    :icon="Mail"
    :error-message="errorMessage"
    google-label="Continue with Google"
    @google-success="onGoogleSuccess"
    @google-error="onGoogleError"
  >
    <form @submit.prevent="handleLogin" class="space-y-4">
      <div>
        <label class="text-xs font-bold text-base-content block mb-1">Email or Username</label>
        <input
          v-model="email"
          type="text"
          required
          placeholder="you@example.com"
          class="input input-sm input-bordered w-full rounded-xl text-xs"
        />
      </div>

      <div>
        <div class="flex justify-between items-center mb-1">
          <label class="text-xs font-bold text-base-content">Password</label>
        </div>
        <input
          v-model="password"
          type="password"
          required
          placeholder="••••••••"
          class="input input-sm input-bordered w-full rounded-xl text-xs"
        />
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="btn btn-primary btn-sm w-full rounded-xl font-bold text-xs shadow-xs"
      >
        <span v-if="loading" class="loading loading-spinner"></span>
        <span v-else>Sign In</span>
      </button>
    </form>

    <template #footer>
      Don't have an account yet?
      <router-link to="/register" class="text-primary font-bold hover:underline ml-1">
        Sign up now
      </router-link>
    </template>
  </AuthCardLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Mail } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'
import AuthCardLayout from '../components/auth/AuthCardLayout.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toastStore = useToastStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  errorMessage.value = ''
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    toastStore.success('Signed in successfully!')
    const redirect = route.query.redirect || '/account'
    router.push(redirect)
  } catch (err) {
    console.error('Login error:', err)
    errorMessage.value = 'Invalid email/username or password.'
  } finally {
    loading.value = false
  }
}

function onGoogleSuccess() {
  toastStore.success('Signed in with Google!')
  const redirect = route.query.redirect || '/account'
  router.push(redirect)
}

function onGoogleError(msg) {
  errorMessage.value = msg
}
</script>

