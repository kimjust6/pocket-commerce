<template>
  <div class="py-16 bg-base-100 min-h-screen">
    <div class="container mx-auto px-4 max-w-xl text-center space-y-6">
      <div v-if="verifying" class="py-12 space-y-4">
        <span class="loading loading-spinner loading-lg text-primary"></span>
        <p class="text-sm text-base-content/70 font-medium">Verifying your Stripe payment...</p>
      </div>

      <div v-else-if="verificationError" class="py-8 space-y-5">
        <div class="inline-flex p-4 rounded-3xl bg-error/10 text-error">
          <AlertCircle class="w-12 h-12" />
        </div>
        <h1 class="font-serif text-3xl font-bold text-base-content tracking-tight">
          Payment Verification Pending
        </h1>
        <p class="text-sm text-base-content/70 leading-relaxed max-w-md mx-auto">
          {{ verificationError }}
        </p>
        <div class="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <router-link to="/account" class="btn btn-primary rounded-xl font-bold px-8">
            View My Orders
          </router-link>
          <router-link to="/shop" class="btn btn-outline rounded-xl font-bold px-6">
            Return to Shop
          </router-link>
        </div>
      </div>

      <template v-else>
        <div class="inline-flex p-4 rounded-3xl bg-success/10 text-success">
          <CheckCircle2 class="w-12 h-12" />
        </div>

        <h1 class="font-serif text-3xl sm:text-4xl font-bold text-base-content tracking-tight">
          Order Confirmed
        </h1>

        <p class="text-sm text-base-content/70 leading-relaxed max-w-md mx-auto">
          Thank you for your purchase. We have received your order and are preparing your cards for shipment on 100% recycled paper stock.
        </p>

        <div class="p-6 bg-base-200/50 rounded-3xl border border-stone-200/80 dark:border-stone-800 space-y-3 text-left">
          <div v-if="orderId" class="flex justify-between items-center text-xs">
            <span class="text-base-content/60 font-medium">Order Number:</span>
            <span class="font-mono font-bold text-primary">{{ orderId }}</span>
          </div>
          <div v-if="paymentStatus" class="flex justify-between items-center text-xs">
            <span class="text-base-content/60 font-medium">Payment Status:</span>
            <span class="badge badge-success badge-outline font-bold text-[10px] uppercase">{{ paymentStatus }}</span>
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
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { CheckCircle2, AlertCircle } from 'lucide-vue-next'
import { useCartStore } from '../stores/cart'
import { verifyStripeSession } from '../services/paymentService'

const route = useRoute()
const cartStore = useCartStore()

const verifying = ref(false)
const verifiedOrderId = ref('')
const paymentStatus = ref('')
const verificationError = ref('')

const orderId = computed(() => verifiedOrderId.value || route.query.order_id || '')

onMounted(async () => {
  const sessionId = route.query.session_id
  if (sessionId) {
    verifying.value = true
    try {
      const res = await verifyStripeSession(sessionId)
      if (res?.orderId) {
        verifiedOrderId.value = res.orderId
      }
      if (res?.paid) {
        paymentStatus.value = 'Paid'
        cartStore.clearCart()
      } else {
        paymentStatus.value = res?.paymentStatus || 'Unpaid'
        verificationError.value = 'Your payment has not been confirmed yet. Please check your order history in a moment.'
      }
    } catch (err) {
      console.error('Stripe verification error:', err)
      verificationError.value = 'We could not verify your Stripe payment right now. Please check your order history.'
    } finally {
      verifying.value = false
    }
  } else if (!route.query.order_id) {
    verificationError.value = 'No order reference was provided.'
  }
})
</script>
