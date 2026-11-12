<template>
  <div class="bg-base-200/50 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
    <h2 class="text-lg font-extrabold text-base-content tracking-tight">
      {{ title }}
    </h2>

    <div class="space-y-3 text-sm">
      <div class="flex justify-between text-base-content/70">
        <span>Subtotal ({{ cartStore.totalItems }} items)</span>
        <span class="font-bold text-base-content">{{ formatPrice(cartStore.subtotal) }}</span>
      </div>

      <div v-if="cartStore.discountAmount > 0" class="flex justify-between text-success">
        <span>Discount ({{ cartStore.coupon?.code }})</span>
        <span class="font-bold">-{{ formatPrice(cartStore.discountAmount) }}</span>
      </div>

      <div class="flex justify-between text-base-content/70">
        <span>Shipping</span>
        <span v-if="cartStore.shippingAmount === 0" class="font-bold text-success">
          FREE
        </span>
        <span v-else class="font-bold text-base-content">
          {{ formatPrice(cartStore.shippingAmount) }}
        </span>
      </div>

      <div class="flex justify-between text-base-content/70">
        <span>Estimated Sales Tax (8%)</span>
        <span class="font-bold text-base-content">{{ formatPrice(cartStore.taxAmount) }}</span>
      </div>

      <div class="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between items-baseline">
        <span class="text-base font-extrabold text-base-content">Total</span>
        <span class="text-2xl font-black text-primary">{{ formatPrice(cartStore.total) }}</span>
      </div>
    </div>

    <!-- Promo Code Input -->
    <div v-if="showCoupon" class="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
      <label class="text-xs font-bold text-base-content/80 block">Promo Code</label>
      <div class="join w-full">
        <input
          v-model="couponCode"
          type="text"
          placeholder="e.g. WELCOME20"
          class="input input-sm input-bordered join-item w-full text-xs uppercase"
          @keyup.enter="handleApplyCoupon"
        />
        <button
          type="button"
          @click="handleApplyCoupon"
          class="btn btn-sm btn-outline join-item font-bold text-xs"
        >
          Apply
        </button>
      </div>
      <p v-if="couponMessage" :class="['text-xs font-semibold', couponSuccess ? 'text-success' : 'text-error']">
        {{ couponMessage }}
      </p>
    </div>

    <!-- Actions slot -->
    <div v-if="$slots.actions" class="pt-2">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCartStore } from '../../stores/cart'
import { formatPrice } from '../../utils/formatters'

defineProps({
  title: {
    type: String,
    default: 'Order Summary',
  },
  showCoupon: {
    type: Boolean,
    default: true,
  },
})

const cartStore = useCartStore()
const couponCode = ref('')
const couponMessage = ref('')
const couponSuccess = ref(false)

function handleApplyCoupon() {
  if (!couponCode.value.trim()) return
  const res = cartStore.applyCoupon(couponCode.value)
  couponSuccess.value = res.success
  couponMessage.value = res.message
  if (res.success) {
    couponCode.value = ''
  }
}
</script>

