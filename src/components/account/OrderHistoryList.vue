<template>
  <div class="space-y-4">
    <div v-if="loading" class="space-y-3">
      <div v-for="n in 3" :key="n" class="skeleton h-24 w-full rounded-2xl"></div>
    </div>

    <div v-else-if="orders.length === 0" class="text-center py-16 bg-base-200/40 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-3">
      <Package class="w-10 h-10 text-base-content/30 mx-auto" />
      <h3 class="font-extrabold text-base text-base-content">No orders placed yet</h3>
      <p class="text-xs text-base-content/60">When you purchase cards, your order history and receipts will appear here.</p>
      <router-link to="/shop" class="btn btn-primary btn-sm rounded-xl font-bold mt-2">
        Start Shopping
      </router-link>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="order in orders"
        :key="order.id"
        class="bg-base-100 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4"
      >
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
          <div class="space-y-0.5">
            <span class="font-mono font-bold text-base-content">Order #{{ order.id }}</span>
            <span class="text-base-content/50 block">{{ formatDate(order.created) }}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="badge badge-info badge-outline font-bold text-[10px] uppercase">
              {{ order.status || 'Pending' }}
            </span>
            <span class="font-black text-sm text-base-content">
              {{ formatPrice(order.total_amount) }}
            </span>
          </div>
        </div>

        <div class="text-xs text-base-content/70">
          <span class="font-bold text-base-content">Shipping to:</span> {{ order.shipping_address }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Package } from 'lucide-vue-next'
import { formatPrice, formatDate } from '../../utils/formatters'

defineProps({
  orders: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})
</script>
