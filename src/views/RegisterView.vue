<template>
  <div class="py-16 bg-base-100 min-h-screen flex items-center justify-center">
    <div class="container mx-auto px-4 max-w-md">
      <div class="bg-base-200/50 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 shadow-md space-y-6">
        <div class="text-center space-y-2">
          <span class="text-3xl">🎉</span>
          <h1 class="text-2xl font-black text-base-content tracking-tight">Create Account</h1>
          <p class="text-xs text-base-content/60">Join Pocket Commerce for easy card shopping</p>
        </div>

        <div v-if="errorMessage" class="alert alert-error text-xs rounded-xl font-bold">
          {{ errorMessage }}
        </div>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label class="text-xs font-bold text-base-content block mb-1">Full Name</label>
            <input
              v-model="name"
              type="text"
              required
              placeholder="Your Name"
              class="input input-sm input-bordered w-full rounded-xl text-xs"
            />
          </div>

          <div>
            <label class="text-xs font-bold text-base-content block mb-1">Email Address</label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="you@example.com"
              class="input input-sm input-bordered w-full rounded-xl text-xs"
            />
          </div>

          <div>
            <label class="text-xs font-bold text-base-content block mb-1">Username (optional)</label>
            <input
              v-model="username"
              type="text"
              placeholder="coolpaperlover"
              class="input input-sm input-bordered w-full rounded-xl text-xs"
            />
          </div>

          <div>
            <label class="text-xs font-bold text-base-content block mb-1">Password</label>
            <input
              v-model="password"
              type="password"
              required
              minlength="8"
              placeholder="At least 8 characters"
              class="input input-sm input-bordered w-full rounded-xl text-xs"
            />
          </div>

          <div>
            <label class="text-xs font-bold text-base-content block mb-1">Confirm Password</label>
            <input
              v-model="passwordConfirm"
              type="password"
              required
              minlength="8"
              placeholder="Repeat password"
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

        <div class="border-t border-slate-200 dark:border-slate-800 pt-4 text-center text-xs text-base-content/60">
          Already have an account?
          <router-link to="/login" class="text-primary font-bold hover:underline ml-1">
            Sign in
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

const name = ref('')
const email = ref('')
const username = ref('')
const password = ref('')
const passwordConfirm = ref('')
const loading = ref(false)
const errorMessage = ref('')

async function handleRegister() {
  errorMessage.value = ''
  if (password.value !== passwordConfirm.value) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  loading.value = true
  try {
    await authStore.register({
      email: email.value,
      name: name.value,
      username: username.value,
      password: password.value,
      passwordConfirm: passwordConfirm.value,
    })
    toastStore.success('Welcome to Pocket Commerce!')
    router.push('/account')
  } catch (err) {
    console.error('Registration error:', err)
    errorMessage.value = err.message || 'Could not register account. Please try another email or username.'
  } finally {
    loading.value = false
  }
}
</script>

