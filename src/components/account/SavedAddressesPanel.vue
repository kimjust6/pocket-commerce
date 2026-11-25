<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h3 class="font-extrabold text-lg text-base-content">Saved Shipping Addresses</h3>
        <p class="text-xs text-base-content/60">Manage your delivery destinations for quick checkout.</p>
      </div>
      <button
        type="button"
        @click="$emit('open-modal')"
        class="btn btn-primary btn-sm rounded-xl font-bold text-xs"
      >
        + Add New Address
      </button>
    </div>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="n in 2" :key="n" class="skeleton h-32 w-full rounded-2xl"></div>
    </div>

    <div v-else-if="addresses.length === 0" class="text-center py-12 bg-base-200/40 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-8 space-y-3">
      <MapPin class="w-10 h-10 text-base-content/30 mx-auto" />
      <h4 class="font-bold text-sm text-base-content">No saved addresses</h4>
      <p class="text-xs text-base-content/60">Save an address for faster checkout on future orders.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="addr in addresses"
        :key="addr.id"
        class="bg-base-100 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-5 shadow-xs flex justify-between items-start"
      >
        <div class="space-y-1 text-xs text-base-content/80">
          <h4 class="font-bold text-sm text-base-content">{{ addr.name }}</h4>
          <p>{{ addr.street }}</p>
          <p>{{ addr.city }}, {{ addr.state }} {{ addr.zip }}</p>
        </div>
        <button
          type="button"
          @click="$emit('delete', addr.id)"
          class="btn btn-ghost btn-circle btn-xs text-error"
          aria-label="Delete address"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { MapPin } from 'lucide-vue-next'

defineProps({
  addresses: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['open-modal', 'delete'])
</script>
