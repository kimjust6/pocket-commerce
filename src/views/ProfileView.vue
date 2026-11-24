<template>
  <div class="py-12 bg-base-100 min-h-screen">
    <div class="container mx-auto px-4 md:px-8 max-w-3xl">
      <Breadcrumbs
        :items="[
          { label: 'Home', to: '/' },
          { label: 'Account', to: '/account' },
          { label: 'Profile Settings' }
        ]"
      />

      <h1 class="text-3xl font-extrabold text-base-content tracking-tight mb-8">
        Profile Settings
      </h1>

      <div class="space-y-8">
        <ProfileDetailsForm />
        <PasswordChangeForm />
      </div>
    </div>
  </div>
</template>

<script setup>
import Breadcrumbs from '../components/ui/Breadcrumbs.vue'
import ProfileDetailsForm from '../components/profile/ProfileDetailsForm.vue'
import PasswordChangeForm from '../components/profile/PasswordChangeForm.vue'
</script>
