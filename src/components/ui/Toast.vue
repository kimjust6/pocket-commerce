<template>
  <div class="toast toast-bottom toast-end z-50 p-4">
    <transition-group
      enter-active-class="transition duration-300 ease-out transform"
      enter-from-class="opacity-0 translate-y-4 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-200 ease-in transform"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-4 scale-95"
    >
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        :class="[
          'alert shadow-md border rounded-xl flex items-center justify-between gap-3 text-sm font-semibold',
          toast.type === 'success'
            ? 'alert-success border-emerald-500/30'
            : toast.type === 'error'
            ? 'alert-error border-rose-500/30'
            : 'alert-info border-sky-500/30'
        ]"
      >
        <span>{{ toast.message }}</span>
        <button
          @click="toastStore.remove(toast.id)"
          class="btn btn-ghost btn-xs btn-circle text-current hover:bg-black/10"
        >
          ✕
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useToastStore } from '../../stores/toast'

const toastStore = useToastStore()
</script>

