<template>
  <div class="py-12 bg-base-100 min-h-screen">
    <div class="container mx-auto px-4 md:px-8 max-w-7xl">
      <!-- Breadcrumbs -->
      <Breadcrumbs
        :items="[
          { label: 'Home', to: '/' },
          { label: 'Cart', to: '/cart' },
          { label: 'Checkout' }
        ]"
      />

      <h1 class="text-3xl sm:text-4xl font-extrabold text-base-content tracking-tight mb-8">
        Secure Checkout
      </h1>

      <div v-if="route.query.canceled === 'true'" class="alert alert-warning text-xs rounded-xl font-semibold mb-6">
        Your Stripe payment was canceled. You can review your details and try again.
      </div>

      <div v-if="cartStore.items.length === 0" class="text-center py-16 space-y-4">
        <p class="text-base text-base-content/70">Your cart is currently empty.</p>
        <router-link to="/shop" class="btn btn-primary rounded-xl font-bold">
          Start Shopping
        </router-link>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <!-- Checkout Form Column -->
        <div class="lg:col-span-7 space-y-8">
          <!-- Step 1: Contact Information -->
          <div class="bg-base-200/50 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-base font-extrabold text-base-content flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-primary text-primary-content text-xs flex items-center justify-center font-bold">1</span>
                Contact Information
              </h2>
              <span v-if="!authStore.isAuthenticated" class="text-xs text-base-content/60">
                Already have an account?
                <router-link to="/login" class="text-primary font-bold hover:underline">Sign In</router-link>
              </span>
            </div>

            <div>
              <label class="text-xs font-bold text-base-content block mb-1">Email Address</label>
              <input
                v-model="form.email"
                type="email"
                required
                placeholder="you@example.com"
                class="input input-sm input-bordered w-full rounded-xl text-xs"
              />
            </div>
          </div>

          <!-- Step 2: Shipping Address -->
          <div class="bg-base-200/50 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-base font-extrabold text-base-content flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-primary text-primary-content text-xs flex items-center justify-center font-bold">2</span>
                Shipping Address
              </h2>
              <!-- Select saved address dropdown if available -->
              <div v-if="savedAddresses.length > 0">
                <select
                  @change="selectSavedAddress($event.target.value)"
                  class="select select-bordered select-xs rounded-lg text-xs"
                >
                  <option value="">Select saved address...</option>
                  <option v-for="addr in savedAddresses" :key="addr.id" :value="addr.id">
                    {{ addr.name }} - {{ addr.street }}, {{ addr.city }}
                  </option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="sm:col-span-2">
                <label class="text-xs font-bold text-base-content block mb-1">Recipient Name</label>
                <input
                  v-model="form.fullName"
                  type="text"
                  required
                  placeholder="Full Name"
                  class="input input-sm input-bordered w-full rounded-xl text-xs"
                />
              </div>

              <div class="sm:col-span-2">
                <label class="text-xs font-bold text-base-content block mb-1">Street Address</label>
                <input
                  v-model="form.street"
                  type="text"
                  required
                  placeholder="123 Celebration Way, Apt 4"
                  class="input input-sm input-bordered w-full rounded-xl text-xs"
                />
              </div>

              <div>
                <label class="text-xs font-bold text-base-content block mb-1">City</label>
                <input
                  v-model="form.city"
                  type="text"
                  required
                  placeholder="New York"
                  class="input input-sm input-bordered w-full rounded-xl text-xs"
                />
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="text-xs font-bold text-base-content block mb-1">State</label>
                  <input
                    v-model="form.state"
                    type="text"
                    required
                    placeholder="NY"
                    class="input input-sm input-bordered w-full rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label class="text-xs font-bold text-base-content block mb-1">ZIP Code</label>
                  <input
                    v-model="form.zip"
                    type="text"
                    required
                    placeholder="10001"
                    class="input input-sm input-bordered w-full rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>

            <div v-if="authStore.isAuthenticated" class="pt-2">
              <label class="cursor-pointer label justify-start gap-2 p-0">
                <input v-model="form.saveAddress" type="checkbox" class="checkbox checkbox-xs checkbox-primary" />
                <span class="label-text text-xs text-base-content/80 font-semibold">Save address for future orders</span>
              </label>
            </div>
          </div>

          <!-- Step 3: Payment Method -->
          <div class="bg-base-200/50 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-4">
            <h2 class="text-base font-extrabold text-base-content flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-primary text-primary-content text-xs flex items-center justify-center font-bold">3</span>
              Payment Method
            </h2>

            <div class="grid grid-cols-2 gap-3">
              <label
                :class="[
                  'cursor-pointer border rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all',
                  paymentMethod === 'stripe' ? 'border-primary bg-primary/5 shadow-xs font-bold' : 'border-slate-200 dark:border-slate-800'
                ]"
              >
                <input type="radio" value="stripe" v-model="paymentMethod" class="hidden" />
                <CreditCard class="w-6 h-6 text-primary" />
                <span class="text-xs font-bold text-base-content">Stripe Checkout</span>
              </label>

              <label
                :class="[
                  'cursor-pointer border rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all',
                  paymentMethod === 'banano' ? 'border-primary bg-primary/5 shadow-xs font-bold' : 'border-slate-200 dark:border-slate-800'
                ]"
              >
                <input type="radio" value="banano" v-model="paymentMethod" class="hidden" />
                <Coins class="w-6 h-6 text-amber-500" />
                <span class="text-xs font-bold text-base-content">Banano Crypto</span>
              </label>
            </div>

            <!-- Stripe Info -->
            <div v-if="paymentMethod === 'stripe'" class="p-4 bg-primary/5 border border-primary/20 rounded-2xl space-y-1.5 text-xs">
              <p class="font-bold text-base-content">Encrypted Stripe Checkout</p>
              <p class="text-base-content/70">
                You will be redirected to Stripe to complete your payment securely using Credit/Debit Card, Apple Pay, or Google Pay.
              </p>
            </div>

            <!-- Banano Crypto Info -->
            <div v-else class="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-2 text-xs">
              <p class="font-bold text-base-content">Instant & Feeless Banano Payment</p>
              <p class="text-base-content/70">
                Send <span class="font-bold text-primary">{{ (cartStore.total * 250).toFixed(0) }} BAN</span> to our merchant address.
              </p>
              <div class="bg-base-100 p-2 rounded-lg font-mono text-[10px] break-all border border-slate-200 dark:border-slate-800">
                ban_1ka1ium4pfue3uxtntqsboa8egcw864xqdbc85vc5z33x5ne52pfcqigp5cb
              </div>
            </div>
          </div>

          <!-- Error Alert -->
          <div v-if="errorMessage" class="alert alert-error text-xs rounded-xl font-bold">
            {{ errorMessage }}
          </div>

          <!-- Place Order Button -->
          <button
            type="button"
            @click="handlePlaceOrder"
            :disabled="processingOrder"
            class="btn btn-primary btn-lg w-full rounded-2xl font-black text-base shadow-md"
          >
            <span v-if="processingOrder" class="loading loading-spinner"></span>
            <span v-else>Place Order • {{ formatPrice(cartStore.total) }}</span>
          </button>
        </div>

        <!-- Order Summary Column -->
        <div class="lg:col-span-5 space-y-6">
          <div class="bg-base-200/50 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
            <h2 class="text-lg font-extrabold text-base-content tracking-tight">In Your Order</h2>

            <!-- Reused CartItemRow with mode="review" -->
            <div class="space-y-1 max-h-72 overflow-y-auto pr-1">
              <CartItemRow
                v-for="item in cartStore.items"
                :key="item.id"
                :item="item"
                mode="review"
              />
            </div>
          </div>

          <!-- Reused OrderSummary (without coupon input since it's final checkout review) -->
          <OrderSummary :show-coupon="false" title="Payment Summary" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { CreditCard, Coins } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'
import { useToastStore } from '../stores/toast'
import { formatPrice } from '../utils/formatters'
import { createOrder, getUserAddresses, createAddress, createStripeCheckoutSession } from '../services/pocketbase'
import Breadcrumbs from '../components/ui/Breadcrumbs.vue'
import CartItemRow from '../components/cart/CartItemRow.vue'
import OrderSummary from '../components/cart/OrderSummary.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const cartStore = useCartStore()
const toastStore = useToastStore()

const savedAddresses = ref([])
const paymentMethod = ref('stripe')
const processingOrder = ref(false)
const errorMessage = ref('')

const form = ref({
  email: authStore.user?.email || '',
  fullName: authStore.user?.name || '',
  street: '',
  city: '',
  state: '',
  zip: '',
  saveAddress: false,
})

function selectSavedAddress(addressId) {
  const selected = savedAddresses.value.find((a) => a.id === addressId)
  if (selected) {
    form.value.fullName = selected.name || form.value.fullName
    form.value.street = selected.street || ''
    form.value.city = selected.city || ''
    form.value.state = selected.state || ''
    form.value.zip = selected.zip || ''
  }
}

async function handlePlaceOrder() {
  errorMessage.value = ''
  if (!form.value.email || !form.value.fullName || !form.value.street || !form.value.city || !form.value.zip) {
    errorMessage.value = 'Please complete all required shipping fields.'
    return
  }

  processingOrder.value = true
  try {
    const shippingString = `${form.value.fullName}, ${form.value.street}, ${form.value.city}, ${form.value.state} ${form.value.zip}`

    if (form.value.saveAddress && authStore.isAuthenticated) {
      try {
        await createAddress({
          name: form.value.fullName,
          street: form.value.street,
          city: form.value.city,
          state: form.value.state,
          zip: form.value.zip,
        })
      } catch (e) {
        console.warn('Address saving skipped:', e)
      }
    }

    const orderPayload = {
      totalAmount: cartStore.total,
      shippingAddress: shippingString,
      paymentMethod: paymentMethod.value,
      email: form.value.email,
    }

    const orderRecord = await createOrder(orderPayload, cartStore.items)

    if (paymentMethod.value === 'stripe') {
      const session = await createStripeCheckoutSession({
        orderId: orderRecord.id,
        email: form.value.email,
        items: cartStore.items,
        shippingAmount: cartStore.shippingAmount,
        taxAmount: cartStore.taxAmount,
        discountAmount: cartStore.discountAmount,
      })

      if (session?.url) {
        window.location.href = session.url
        return
      }
      throw new Error('Stripe did not return a checkout URL.')
    }

    cartStore.clearCart()
    toastStore.success('Your order has been placed!')
    router.push({
      path: '/checkout/success',
      query: { order_id: orderRecord.id },
    })
  } catch (err) {
    console.error('Checkout error:', err)
    errorMessage.value = err?.response?.error || err?.message || 'We could not process your order. Please verify your details and try again.'
  } finally {
    processingOrder.value = false
  }
}

onMounted(async () => {
  if (authStore.isAuthenticated) {
    try {
      savedAddresses.value = await getUserAddresses()
      if (savedAddresses.value.length > 0) {
        selectSavedAddress(savedAddresses.value[0].id)
      }
    } catch (e) {
      console.warn('Could not load saved addresses:', e)
    }
  }
})
</script>
