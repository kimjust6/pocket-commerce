<template>
  <div class="py-12 bg-base-100 min-h-screen">
    <div class="container mx-auto px-4 md:px-8 max-w-7xl">
      <!-- Breadcrumbs -->
      <div class="text-xs breadcrumbs text-base-content/60 mb-6">
        <ul>
          <li><router-link to="/">Home</router-link></li>
          <li><router-link to="/cart">Cart</router-link></li>
          <li class="font-bold text-base-content">Checkout</li>
        </ul>
      </div>

      <h1 class="text-3xl sm:text-4xl font-extrabold text-base-content tracking-tight mb-8">
        Secure Checkout
      </h1>

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
                Already have an account? <router-link to="/login" class="text-primary font-bold hover:underline">Sign In</router-link>
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

            <!-- Payment tabs / options -->
            <div class="grid grid-cols-2 gap-3">
              <label
                :class="[
                  'cursor-pointer border rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all',
                  paymentMethod === 'card' ? 'border-primary bg-primary/5 shadow-xs font-bold' : 'border-slate-200 dark:border-slate-800'
                ]"
              >
                <input type="radio" value="card" v-model="paymentMethod" class="hidden" />
                <span class="text-2xl">💳</span>
                <span class="text-xs font-bold text-base-content">Credit / Debit Card</span>
              </label>

              <label
                :class="[
                  'cursor-pointer border rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all',
                  paymentMethod === 'banano' ? 'border-primary bg-primary/5 shadow-xs font-bold' : 'border-slate-200 dark:border-slate-800'
                ]"
              >
                <input type="radio" value="banano" v-model="paymentMethod" class="hidden" />
                <span class="text-2xl">🍌</span>
                <span class="text-xs font-bold text-base-content">Banano Crypto</span>
              </label>
            </div>

            <!-- Card inputs -->
            <div v-if="paymentMethod === 'card'" class="space-y-3 pt-2">
              <div>
                <label class="text-xs font-bold text-base-content block mb-1">Card Number</label>
                <input
                  v-model="card.number"
                  type="text"
                  placeholder="4000 1234 5678 9010"
                  class="input input-sm input-bordered w-full rounded-xl text-xs font-mono"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-xs font-bold text-base-content block mb-1">Exp Date (MM/YY)</label>
                  <input
                    v-model="card.expiry"
                    type="text"
                    placeholder="12/28"
                    class="input input-sm input-bordered w-full rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label class="text-xs font-bold text-base-content block mb-1">Security Code (CVC)</label>
                  <input
                    v-model="card.cvc"
                    type="password"
                    maxlength="4"
                    placeholder="123"
                    class="input input-sm input-bordered w-full rounded-xl text-xs font-mono"
                  />
                </div>
              </div>
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
            @click="handlePlaceOrder"
            :disabled="processingOrder"
            class="btn btn-primary btn-lg w-full rounded-2xl font-black text-base shadow-md"
          >
            <span v-if="processingOrder" class="loading loading-spinner"></span>
            <span v-else>Place Order • ${{ cartStore.total.toFixed(2) }}</span>
          </button>
        </div>

        <!-- Order Summary Sidebar -->
        <div class="lg:col-span-5 space-y-6">
          <div class="bg-base-200/50 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
            <h2 class="text-lg font-extrabold text-base-content tracking-tight">In Your Order</h2>

            <div class="space-y-3 max-h-72 overflow-y-auto pr-1">
              <div
                v-for="item in cartStore.items"
                :key="item.id"
                class="flex items-center gap-3 py-2 border-b border-slate-200/60 dark:border-slate-800"
              >
                <div class="relative w-14 h-14 rounded-lg bg-base-100 overflow-hidden flex-shrink-0 border border-slate-200/60 dark:border-slate-800">
                  <img :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
                  <span class="absolute top-0 right-0 badge badge-primary badge-xs font-bold text-[9px]">
                    {{ item.quantity }}
                  </span>
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-bold text-xs text-base-content truncate">{{ item.name }}</h4>
                  <span class="text-[11px] text-base-content/60 block">{{ item.format }}</span>
                </div>
                <span class="text-xs font-bold text-base-content">
                  ${{ (item.price * item.quantity).toFixed(2) }}
                </span>
              </div>
            </div>

            <!-- Price Breakdown -->
            <div class="space-y-2 text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
              <div class="flex justify-between text-base-content/70">
                <span>Subtotal</span>
                <span class="font-bold text-base-content">${{ cartStore.subtotal.toFixed(2) }}</span>
              </div>

              <div v-if="cartStore.discountAmount > 0" class="flex justify-between text-success">
                <span>Discount</span>
                <span class="font-bold">-${{ cartStore.discountAmount.toFixed(2) }}</span>
              </div>

              <div class="flex justify-between text-base-content/70">
                <span>Shipping</span>
                <span v-if="cartStore.shippingAmount === 0" class="font-bold text-success">FREE</span>
                <span v-else class="font-bold text-base-content">${{ cartStore.shippingAmount.toFixed(2) }}</span>
              </div>

              <div class="flex justify-between text-base-content/70">
                <span>Estimated Tax (8%)</span>
                <span class="font-bold text-base-content">${{ cartStore.taxAmount.toFixed(2) }}</span>
              </div>

              <div class="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between items-baseline">
                <span class="text-sm font-extrabold text-base-content">Total</span>
                <span class="text-2xl font-black text-primary">${{ cartStore.total.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'
import { useToastStore } from '../stores/toast'
import { createOrder, getUserAddresses, createAddress } from '../services/pocketbase'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()
const toastStore = useToastStore()

const savedAddresses = ref([])
const paymentMethod = ref('card')
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

const card = ref({
  number: '4242 •••• •••• 4242',
  expiry: '12/28',
  cvc: '123',
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

    // 1. Optionally save address if requested
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

    // 2. Create Order in PocketBase
    const orderPayload = {
      totalAmount: cartStore.total,
      shippingAddress: shippingString,
      paymentMethod: paymentMethod.value,
      email: form.value.email,
    }

    const orderRecord = await createOrder(orderPayload, cartStore.items)

    // 3. Clear cart and redirect
    cartStore.clearCart()
    toastStore.success('Your order has been placed!')
    router.push({
      path: '/checkout/success',
      query: { order_id: orderRecord.id },
    })
  } catch (err) {
    console.error('Checkout error:', err)
    errorMessage.value = 'We could not process your order. Please verify your details and try again.'
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

