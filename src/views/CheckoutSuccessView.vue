<template>
  <div class="py-16 bg-base-100 min-h-screen">
    <div class="container mx-auto px-4 max-w-xl text-center space-y-6">
      <div class="inline-flex p-4 rounded-3xl bg-success/10 text-success text-5xl">
        🎉
      </div>

      <h1 class="text-3xl sm:text-4xl font-black text-base-content tracking-tight">
        Thank You for Your Order!
      </h1>

      <p class="text-sm text-base-content/70 leading-relaxed max-w-md mx-auto">
        We've received your greeting card order and are already getting your cards packaged with care on 100% recycled paper stock.
      </p>

      <div class="p-6 bg-base-200/50 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3 text-left">
        <div class="flex justify-between items-center text-xs">
          <span class="text-base-content/60 font-medium">Order Number:</span>
          <span class="font-mono font-bold text-primary">{{ orderId || 'ORD-' + Math.floor(Math.random() * 900000 + 100000) }}</span>
        </div>
        <div class="flex justify-between items-center text-xs">
          <span class="text-base-content/60 font-medium">Estimated Delivery:</span>
          <span class="font-bold text-base-content">2 - 4 Business Days</span>
        </div>
        <div class="flex justify-between items-center text-xs">
          <span class="text-base-content/60 font-medium">Shipping Method:</span>
          <span class="font-bold text-base-content">Standard Rigid Mailer</span>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row justify-center gap-3 pt-4">
        <router-link to="/shop" class="btn btn-primary rounded-xl font-bold px-8 shadow-sm">
          Continue Shopping
        </router-link>
        <router-link to="/account" class="btn btn-outline rounded-xl font-bold px-6">
          View My Orders
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const orderId = computed(() => route.query.order_id || '')
</script>

