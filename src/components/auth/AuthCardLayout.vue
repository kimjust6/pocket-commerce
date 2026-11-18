<template>
  <div class="py-16 bg-base-100 min-h-screen flex items-center justify-center">
    <div class="container mx-auto px-4 max-w-md">
      <div class="bg-base-200/50 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 shadow-md space-y-6">
        <div class="text-center space-y-2">
          <div class="inline-flex p-3 rounded-2xl bg-primary/10 text-primary">
            <component :is="icon" class="w-7 h-7" />
          </div>
          <h1 class="text-2xl font-black text-base-content tracking-tight">{{ title }}</h1>
          <p class="text-xs text-base-content/60">{{ subtitle }}</p>
        </div>

        <div v-if="errorMessage" class="alert alert-error text-xs rounded-xl font-bold">
          {{ errorMessage }}
        </div>

        <GoogleAuthButton
          :label="googleLabel"
          @success="$emit('googleSuccess')"
          @error="(msg) => $emit('googleError', msg)"
        />

        <div class="divider text-xs font-medium text-base-content/40 my-1">OR</div>

        <slot />

        <div class="border-t border-slate-200 dark:border-slate-800 pt-4 text-center text-xs text-base-content/60">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import GoogleAuthButton from './GoogleAuthButton.vue'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  icon: { type: [Object, Function], required: true },
  errorMessage: { type: String, default: '' },
  googleLabel: { type: String, required: true },
})

defineEmits(['googleSuccess', 'googleError'])
</script>

