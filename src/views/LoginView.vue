<template>
  <AuthCardLayout
    title="Welcome Back"
    subtitle="Sign in to your Pocket Commerce account"
    :icon="Mail"
    :error-message="errorMessage"
    google-label="Continue with Google"
    @google-success="onOAuthSuccess"
    @google-error="onOAuthError"
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
import { Mail } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import { useAuthForm } from '../composables/useAuthForm'
import AuthCardLayout from '../components/auth/AuthCardLayout.vue'

const authStore = useAuthStore()
const { loading, errorMessage, submitAuth, onOAuthSuccess, onOAuthError } = useAuthForm({
  useQueryRedirect: true,
  oauthSuccessMessage: 'Signed in with Google!',
})

const email = ref('')
const password = ref('')

async function handleLogin() {
  await submitAuth(
    () => authStore.login(email.value, password.value),
    {
      successMessage: 'Signed in successfully!',
      fallbackError: 'Invalid email/username or password.',
    }
  )
}
</script>
