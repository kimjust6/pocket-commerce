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
          <div class="bg-base-200/50 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-6 space-y-4">
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
          <div class="bg-base-200/50 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-6 space-y-4">
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
          <div class="bg-base-200/50 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-6 space-y-4">
            <h2 class="text-base font-extrabold text-base-content flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-primary text-primary-content text-xs flex items-center justify-center font-bold">3</span>
              Payment Method
            </h2>

            <div class="grid grid-cols-2 gap-3">
              <label
                v-for="option in PAYMENT_OPTIONS"
                :key="option.value"
                :class="[
                  'cursor-pointer border rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all',
                  paymentMethod === option.value ? 'border-primary bg-primary/5 shadow-xs font-bold' : 'border-stone-200 dark:border-stone-800'
                ]"
              >
                <input type="radio" :value="option.value" v-model="paymentMethod" class="hidden" />
                <component :is="option.icon" :class="['w-6 h-6', option.iconClass]" />
                <span class="text-xs font-bold text-base-content">{{ option.label }}</span>
              </label>
            </div>

            <component :is="activePaymentProvider.infoComponent" :total="cartStore.total" />
          </div>

          <!-- Error Alert -->
          <div v-if="errorMessage" class="alert alert-error text-xs rounded-xl font-bold">
            {{ errorMessage }}
          </div>

          <!-- Place Order Button -->
          <button
            type="button"
            @click="placeOrder"
            :disabled="processingOrder"
            class="btn btn-primary btn-lg w-full rounded-2xl font-black text-base shadow-md"
          >
            <span v-if="processingOrder" class="loading loading-spinner"></span>
            <span v-else>Place Order • {{ formatPrice(cartStore.total) }}</span>
          </button>
        </div>

        <!-- Order Summary Column -->
        <div class="lg:col-span-5 space-y-6">
          <div class="bg-base-200/50 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-6 shadow-xs space-y-5">
            <h2 class="text-lg font-extrabold text-base-content tracking-tight">In Your Order</h2>

            <div class="space-y-1 max-h-72 overflow-y-auto pr-1">
              <CartItemRow
                v-for="item in cartStore.items"
                :key="item.id"
                :item="item"
                mode="review"
              />
            </div>
          </div>

          <OrderSummary :show-coupon="false" title="Payment Summary" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'
import { formatPrice } from '../utils/formatters'
import { PAYMENT_OPTIONS } from '../services/paymentProviders'
import { useCheckout } from '../composables/useCheckout'
import Breadcrumbs from '../components/ui/Breadcrumbs.vue'
import CartItemRow from '../components/cart/CartItemRow.vue'
import OrderSummary from '../components/cart/OrderSummary.vue'

const route = useRoute()
const authStore = useAuthStore()
const cartStore = useCartStore()

const {
  savedAddresses,
  paymentMethod,
  activePaymentProvider,
  processingOrder,
  errorMessage,
  form,
  selectSavedAddress,
  loadSavedAddresses,
  placeOrder,
} = useCheckout()

onMounted(loadSavedAddresses)
</script>
