<template>
  <AuthCardLayout
    title="Create Account"
    subtitle="Create an account to manage your orders and saved addresses"
    :icon="UserPlus"
    :error-message="errorMessage"
    google-label="Sign up with Google"
    @google-success="onOAuthSuccess"
    @google-error="onOAuthError"
  >
    <form @submit.prevent="handleRegister" class="space-y-4">
      <div v-for="field in registerFields" :key="field.key">
        <label class="text-xs font-bold text-base-content block mb-1">{{ field.label }}</label>
        <input
          v-model="form[field.key]"
          :type="field.type"
          :required="field.required"
          :minlength="field.minlength"
          :placeholder="field.placeholder"
          class="input input-sm input-bordered w-full rounded-xl text-xs"
        />
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="btn btn-primary btn-sm w-full rounded-xl font-bold text-xs shadow-xs"
      >
        <span v-if="loading" class="loading loading-spinner"></span>
        <span v-else>Create Account</span>
      </button>
    </form>

    <template #footer>
      Already have an account?
      <router-link to="/login" class="text-primary font-bold hover:underline ml-1">
        Sign in
      </router-link>
    </template>
  </AuthCardLayout>
</template>

<script setup>
import { ref } from 'vue'
import { UserPlus } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import { useAuthForm } from '../composables/useAuthForm'
import AuthCardLayout from '../components/auth/AuthCardLayout.vue'

const authStore = useAuthStore()
const { loading, errorMessage, submitAuth, onOAuthSuccess, onOAuthError } = useAuthForm({
  oauthSuccessMessage: 'Welcome to Pocket Commerce!',
})

const form = ref({
  name: '',
  email: '',
  username: '',
  password: '',
  passwordConfirm: '',
})

const registerFields = [
  { key: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'Your Name' },
  { key: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'you@example.com' },
  { key: 'username', label: 'Username (optional)', type: 'text', required: false, placeholder: 'johndoe' },
  { key: 'password', label: 'Password', type: 'password', required: true, minlength: 8, placeholder: 'At least 8 characters' },
  { key: 'passwordConfirm', label: 'Confirm Password', type: 'password', required: true, minlength: 8, placeholder: 'Repeat password' },
]

async function handleRegister() {
  if (form.value.password !== form.value.passwordConfirm) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  await submitAuth(
    () => authStore.register(form.value),
    {
      successMessage: 'Welcome to Pocket Commerce!',
      fallbackError: (err) => err?.message || 'Could not register account. Please try another email or username.',
    }
  )
}
</script>
