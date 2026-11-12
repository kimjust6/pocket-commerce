<template>
  <div class="py-12 bg-base-100 min-h-screen">
    <div class="container mx-auto px-4 md:px-8 max-w-3xl">
      <!-- Breadcrumbs -->
      <div class="text-xs breadcrumbs text-base-content/60 mb-6">
        <ul>
          <li><router-link to="/">Home</router-link></li>
          <li><router-link to="/account">Account</router-link></li>
          <li class="font-bold text-base-content">Profile Settings</li>
        </ul>
      </div>

      <h1 class="text-3xl font-extrabold text-base-content tracking-tight mb-8">
        Profile Settings
      </h1>

      <div class="space-y-8">
        <!-- Profile Info Form -->
        <div class="bg-base-200/50 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <h2 class="text-base font-extrabold text-base-content border-b border-slate-200/60 dark:border-slate-800 pb-3">
            Public Profile
          </h2>

          <!-- Avatar Preview & Upload -->
          <div class="flex items-center gap-6">
            <div class="avatar">
              <div class="w-20 h-20 rounded-full ring-2 ring-primary/40 bg-base-100 overflow-hidden">
                <img :src="avatarPreview || authStore.avatarUrl" :alt="authStore.user?.username || 'User'" />
              </div>
            </div>

            <div class="space-y-1">
              <label class="btn btn-outline btn-sm rounded-xl font-bold text-xs cursor-pointer">
                <span>Upload New Avatar</span>
                <input type="file" accept="image/*" class="hidden" @change="onAvatarSelected" />
              </label>
              <p class="text-[11px] text-base-content/60">JPG, PNG or WEBP up to 2MB.</p>
            </div>
          </div>

          <form @submit.prevent="saveProfile" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-bold text-base-content block mb-1">Full Name</label>
                <input
                  v-model="profileForm.name"
                  type="text"
                  placeholder="Your Name"
                  class="input input-sm input-bordered w-full rounded-xl text-xs"
                />
              </div>

              <div>
                <label class="text-xs font-bold text-base-content block mb-1">Username</label>
                <input
                  v-model="profileForm.username"
                  type="text"
                  placeholder="username"
                  required
                  class="input input-sm input-bordered w-full rounded-xl text-xs"
                />
              </div>

              <div class="sm:col-span-2">
                <label class="text-xs font-bold text-base-content block mb-1">Email Address</label>
                <input
                  :value="authStore.user?.email"
                  disabled
                  type="email"
                  class="input input-sm input-bordered w-full rounded-xl text-xs opacity-60 bg-base-200 cursor-not-allowed"
                />
              </div>
            </div>

            <div class="pt-2 flex justify-end">
              <button
                type="submit"
                :disabled="savingProfile"
                class="btn btn-primary btn-sm rounded-xl font-bold px-6 shadow-xs"
              >
                {{ savingProfile ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Security: Change Password -->
        <div class="bg-base-200/50 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <h2 class="text-base font-extrabold text-base-content border-b border-slate-200/60 dark:border-slate-800 pb-3">
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'

const authStore = useAuthStore()
const toastStore = useToastStore()

const avatarFile = ref(null)
const avatarPreview = ref('')
const savingProfile = ref(false)
const changingPassword = ref(false)

const profileForm = ref({
  name: authStore.user?.name || '',
  username: authStore.user?.username || '',
})

const passwordForm = ref({
  oldPassword: '',
  password: '',
  passwordConfirm: '',
})

function onAvatarSelected(event) {
  const file = event.target.files?.[0]
  if (file) {
    avatarFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

async function saveProfile() {
  savingProfile.value = true
  try {
    const formData = new FormData()
    formData.append('name', profileForm.value.name)
    formData.append('username', profileForm.value.username)
    if (avatarFile.value) {
      formData.append('avatar', avatarFile.value)
    }

    await authStore.updateProfile(formData)
    toastStore.success('Profile updated successfully!')
  } catch (err) {
    console.error('Profile update error:', err)
    toastStore.error(err.message || 'Failed to update profile.')
  } finally {
    savingProfile.value = false
  }
}

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

