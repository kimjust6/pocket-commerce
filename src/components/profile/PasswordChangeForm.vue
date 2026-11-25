<template>
  <div class="bg-base-200/50 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6">
    <h2 class="text-base font-extrabold text-base-content border-b border-stone-200/60 dark:border-stone-800 pb-3">
      Change Password
    </h2>

    <form @submit.prevent="changePassword" class="space-y-4 max-w-md">
      <div>
        <label class="text-xs font-bold text-base-content block mb-1">Current Password</label>
        <input
          v-model="passwordForm.oldPassword"
          type="password"
          required
          placeholder="••••••••"
          class="input input-sm input-bordered w-full rounded-xl text-xs"
        />
      </div>

      <div>
        <label class="text-xs font-bold text-base-content block mb-1">New Password</label>
        <input
          v-model="passwordForm.password"
          type="password"
          required
          minlength="8"
          placeholder="At least 8 characters"
          class="input input-sm input-bordered w-full rounded-xl text-xs"
        />
      </div>

      <div>
        <label class="text-xs font-bold text-base-content block mb-1">Confirm New Password</label>
        <input
          v-model="passwordForm.passwordConfirm"
          type="password"
          required
          minlength="8"
          placeholder="Repeat new password"
          class="input input-sm input-bordered w-full rounded-xl text-xs"
        />
      </div>

      <div class="pt-2 flex justify-end">
        <button
          type="submit"
          :disabled="changingPassword"
          class="btn btn-outline btn-sm rounded-xl font-bold px-6"
        >
          {{ changingPassword ? 'Updating...' : 'Update Password' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useToastStore } from '../../stores/toast'

const authStore = useAuthStore()
const toastStore = useToastStore()

const changingPassword = ref(false)
const passwordForm = ref({
  oldPassword: '',
  password: '',
  passwordConfirm: '',
})

async function changePassword() {
  if (passwordForm.value.password !== passwordForm.value.passwordConfirm) {
    toastStore.error('Passwords do not match.')
    return
  }

  changingPassword.value = true
  try {
    await authStore.updateProfile({
      oldPassword: passwordForm.value.oldPassword,
      password: passwordForm.value.password,
      passwordConfirm: passwordForm.value.passwordConfirm,
    })
    toastStore.success('Password updated successfully!')
    passwordForm.value = { oldPassword: '', password: '', passwordConfirm: '' }
  } catch (err) {
    console.error('Password change error:', err)
    toastStore.error(err.message || 'Could not change password. Check current password.')
  } finally {
    changingPassword.value = false
  }
}
</script>
