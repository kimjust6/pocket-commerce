<template>
  <div class="py-16 bg-base-100 min-h-screen flex items-center justify-center">
    <div class="container mx-auto px-4 max-w-md">
      <div class="bg-base-200/50 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 shadow-md space-y-6">
        <div class="text-center space-y-2">
          <div class="inline-flex p-3 rounded-2xl bg-primary/10 text-primary">
            <Mail class="w-7 h-7" />
          </div>
          <h1 class="text-2xl font-black text-base-content tracking-tight">Welcome Back</h1>
          <p class="text-xs text-base-content/60">Sign in to your Pocket Commerce account</p>
        </div>

        <div v-if="errorMessage" class="alert alert-error text-xs rounded-xl font-bold">
          {{ errorMessage }}
        </div>

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

        <div class="border-t border-slate-200 dark:border-slate-800 pt-4 text-center text-xs text-base-content/60">
          Don't have an account yet?
          <router-link to="/register" class="text-primary font-bold hover:underline ml-1">
            Sign up now
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Mail } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'

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
</script>

