<template>
  <AuthCardLayout
    title="Create Account"
    subtitle="Create an account to manage your orders and saved addresses"
    :icon="UserPlus"
    :error-message="errorMessage"
    google-label="Sign up with Google"
    @google-success="onGoogleSuccess"
    @google-error="onGoogleError"
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
import { useRouter } from 'vue-router'
import { UserPlus } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'
import AuthCardLayout from '../components/auth/AuthCardLayout.vue'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

const form = ref({
  name: '',
  email: '',
  username: '',
  password: '',
  passwordConfirm: '',
})
const loading = ref(false)
const errorMessage = ref('')

const registerFields = [
  { key: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'Your Name' },
  { key: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'you@example.com' },
  { key: 'username', label: 'Username (optional)', type: 'text', required: false, placeholder: 'johndoe' },
  { key: 'password', label: 'Password', type: 'password', required: true, minlength: 8, placeholder: 'At least 8 characters' },
  { key: 'passwordConfirm', label: 'Confirm Password', type: 'password', required: true, minlength: 8, placeholder: 'Repeat password' },
]

async function handleRegister() {
  errorMessage.value = ''
  if (form.value.password !== form.value.passwordConfirm) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  loading.value = true
  try {
    await authStore.register(form.value)
    toastStore.success('Welcome to Pocket Commerce!')
    router.push('/account')
  } catch (err) {
    console.error('Registration error:', err)
    errorMessage.value = err.message || 'Could not register account. Please try another email or username.'
  } finally {
    loading.value = false
  }
}

function onGoogleSuccess() {
  toastStore.success('Welcome to Pocket Commerce!')
  router.push('/account')
}

function onGoogleError(msg) {
  errorMessage.value = msg
}
</script>

