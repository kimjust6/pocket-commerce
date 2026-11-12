<template>
  <!-- 1. Drawer Mode -->
  <div
    v-if="mode === 'drawer'"
    class="flex items-center gap-3 bg-base-200/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800"
  >
    <img
      :src="item.image"
      :alt="item.name"
      class="w-16 h-16 object-cover rounded-lg bg-base-100 flex-shrink-0 border border-slate-200/60 dark:border-slate-800"
      loading="lazy"
    />
    <div class="flex-1 min-w-0">
      <router-link
        :to="`/shop/card/${item.slug}`"
        class="font-bold text-sm text-base-content hover:text-primary truncate block"
      >
        {{ item.name }}
      </router-link>
      <span class="text-xs text-base-content/60 block">{{ item.format }}</span>
      <span class="text-sm font-bold text-primary block mt-1">{{ formatPrice(item.price) }}</span>
    </div>

    <div class="flex flex-col items-end gap-2">
      <div class="join border border-slate-200 dark:border-slate-700 rounded-lg bg-base-100">
        <button
          type="button"
          @click="$emit('updateQuantity', item.id, item.quantity - 1)"
          class="join-item btn btn-ghost btn-xs px-2"
          aria-label="Decrease quantity"
        >
          -
        </button>
        <span class="join-item px-2 py-0.5 text-xs font-bold flex items-center">
          {{ item.quantity }}
        </span>
        <button
          type="button"
          @click="$emit('updateQuantity', item.id, item.quantity + 1)"
          class="join-item btn btn-ghost btn-xs px-2"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <button
        type="button"
        @click="$emit('remove', item.id)"
        class="text-[11px] text-error hover:underline font-semibold"
      >
        Remove
      </button>
    </div>
  </div>

  <!-- 2. Review Mode (Used in Checkout) -->
  <div
    v-else-if="mode === 'review'"
    class="flex items-center gap-3 py-2 border-b border-slate-200/60 dark:border-slate-800"
  >
    <div class="relative w-14 h-14 rounded-lg bg-base-100 overflow-hidden flex-shrink-0 border border-slate-200/60 dark:border-slate-800">
      <img :src="item.image" :alt="item.name" class="w-full h-full object-cover" loading="lazy" />
      <span class="absolute top-0 right-0 badge badge-primary badge-xs font-bold text-[9px]">
        {{ item.quantity }}
      </span>
    </div>
    <div class="flex-1 min-w-0">
      <h4 class="font-bold text-xs text-base-content truncate">{{ item.name }}</h4>
      <span class="text-[11px] text-base-content/60 block">{{ item.format }}</span>
    </div>
    <span class="text-xs font-bold text-base-content">
      {{ formatPrice(item.price * item.quantity) }}
    </span>
  </div>

  <!-- 3. Standard Table Mode (Used in Cart View) -->
  <div
    v-else
    class="bg-base-100 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
  >
    <div class="flex items-center gap-4 flex-1 min-w-0">
      <img
        :src="item.image"
        :alt="item.name"
        class="w-20 h-20 object-cover rounded-xl bg-base-200 flex-shrink-0 border border-slate-200/60 dark:border-slate-800"
        loading="lazy"
      />
      <div class="min-w-0 flex-1">
        <router-link
          :to="`/shop/card/${item.slug}`"
          class="font-bold text-base text-base-content hover:text-primary transition-colors block truncate"
        >
          {{ item.name }}
        </router-link>
        <span class="text-xs text-base-content/60 block mt-0.5">{{ item.format }}</span>
        <span class="text-sm font-bold text-primary block mt-1">
          {{ formatPrice(item.price) }} each
        </span>
      </div>
    </div>

    <div class="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
      <!-- Quantity Modifier -->
      <div class="join border border-slate-200 dark:border-slate-700 rounded-xl bg-base-100">
        <button
          type="button"
          @click="$emit('updateQuantity', item.id, item.quantity - 1)"
          class="join-item btn btn-ghost btn-sm px-3"
          aria-label="Decrease quantity"
        >
          -
        </button>
        <span class="join-item px-3 py-1 text-xs font-bold flex items-center">
          {{ item.quantity }}
        </span>
        <button
          type="button"
          @click="$emit('updateQuantity', item.id, item.quantity + 1)"
          class="join-item btn btn-ghost btn-sm px-3"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      <!-- Line Total -->
      <span class="text-base font-extrabold text-base-content min-w-[4.5rem] text-right">
        {{ formatPrice(item.price * item.quantity) }}
      </span>

      <!-- Remove button -->
      <button
        type="button"
        @click="$emit('remove', item.id)"
        class="btn btn-ghost btn-circle btn-sm text-error hover:bg-error/10"
        aria-label="Remove item"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<script setup>
import { formatPrice } from '../../utils/formatters'

defineProps({
  item: {
    type: Object,
    required: true,
  },
  mode: {
    type: String,
    default: 'table', // 'drawer', 'table', 'review'
  },
})

defineEmits(['updateQuantity', 'remove'])
</script>

