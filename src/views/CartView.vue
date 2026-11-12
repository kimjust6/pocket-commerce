<template>
  <div class="py-12 bg-base-100 min-h-screen">
    <div class="container mx-auto px-4 md:px-8 max-w-7xl">
      <!-- Breadcrumbs -->
      <div class="text-xs breadcrumbs text-base-content/60 mb-6">
        <ul>
          <li><router-link to="/">Home</router-link></li>
          <li class="font-bold text-base-content">Shopping Cart</li>
        </ul>
      </div>

      <h1 class="text-3xl sm:text-4xl font-extrabold text-base-content tracking-tight mb-8">
        Your Shopping Cart
      </h1>

      <!-- Empty State -->
      <div
        v-if="cartStore.items.length === 0"
        class="text-center py-20 bg-base-200/40 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-4 max-w-lg mx-auto"
      >
        <div class="text-6xl">🛍️</div>
        <h2 class="text-xl font-extrabold text-base-content">Your cart is empty</h2>
        <p class="text-xs text-base-content/70">
          Looks like you haven't added any cards yet. Explore our handcrafted cards to brighten someone's day!
        </p>
        <router-link to="/shop" class="btn btn-primary rounded-xl font-bold px-8 shadow-sm">
          Browse Cards
        </router-link>
      </div>

      <!-- Cart Content Grid -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <!-- Cart Items List -->
        <div class="lg:col-span-8 space-y-4">
          <div
            v-for="item in cartStore.items"
            :key="item.id"
            class="bg-base-100 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div class="flex items-center gap-4 flex-1 min-w-0">
              <img
                :src="item.image"
                :alt="item.name"
                class="w-20 h-20 object-cover rounded-xl bg-base-200 flex-shrink-0 border border-slate-200/60 dark:border-slate-800"
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
                  ${{ item.price.toFixed(2) }} each
                </span>
              </div>
            </div>

            <div class="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
              <!-- Quantity Modifier -->
              <div class="join border border-slate-200 dark:border-slate-700 rounded-xl bg-base-100">
                <button
                  @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
                  class="join-item btn btn-ghost btn-sm px-3"
                >
                  -
                </button>
                <span class="join-item px-3 py-1 text-xs font-bold flex items-center">
                  {{ item.quantity }}
                </span>
                <button
                  @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
                  class="join-item btn btn-ghost btn-sm px-3"
                >
                  +
                </button>
              </div>

              <!-- Line Total -->
              <span class="text-base font-extrabold text-base-content min-w-[4.5rem] text-right">
                ${{ (item.price * item.quantity).toFixed(2) }}
              </span>

              <!-- Remove button -->
              <button
                @click="cartStore.removeFromCart(item.id)"
                class="btn btn-ghost btn-circle btn-sm text-error"
                aria-label="Remove item"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Bottom Actions -->
          <div class="flex justify-between items-center pt-2">
            <router-link to="/shop" class="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              ← Continue Shopping
            </router-link>
            <button
              @click="cartStore.clearCart"
              class="text-xs font-semibold text-error hover:underline"
            >
              Clear Entire Cart
            </button>
          </div>
        </div>

        <!-- Order Summary Sidebar -->
        <div class="lg:col-span-4 space-y-6">
          <div class="bg-base-200/50 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
            <h2 class="text-lg font-extrabold text-base-content tracking-tight">Order Summary</h2>

            <div class="space-y-3 text-sm">
              <div class="flex justify-between text-base-content/70">
                <span>Subtotal ({{ cartStore.totalItems }} items)</span>
                <span class="font-bold text-base-content">${{ cartStore.subtotal.toFixed(2) }}</span>
              </div>

              <div v-if="cartStore.discountAmount > 0" class="flex justify-between text-success">
                <span>Discount ({{ cartStore.coupon.code }})</span>
                <span class="font-bold">-${{ cartStore.discountAmount.toFixed(2) }}</span>
              </div>

              <div class="flex justify-between text-base-content/70">
                <span>Shipping</span>
                <span v-if="cartStore.shippingAmount === 0" class="font-bold text-success">
                  FREE
                </span>
                <span v-else class="font-bold text-base-content">
                  ${{ cartStore.shippingAmount.toFixed(2) }}
                </span>
              </div>

              <div class="flex justify-between text-base-content/70">
                <span>Estimated Sales Tax (8%)</span>
                <span class="font-bold text-base-content">${{ cartStore.taxAmount.toFixed(2) }}</span>
              </div>

              <div class="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between items-baseline">
                <span class="text-base font-extrabold text-base-content">Total</span>
                <span class="text-2xl font-black text-primary">${{ cartStore.total.toFixed(2) }}</span>
              </div>
            </div>

            <!-- Coupon Code input -->
            <div class="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <label class="text-xs font-bold text-base-content/80 block">Promo Code</label>
              <div class="join w-full">
                <input
                  v-model="couponCode"
                  type="text"
                  placeholder="e.g. WELCOME20"
                  class="input input-sm input-bordered join-item w-full text-xs uppercase"
                />
                <button
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

            <!-- Proceed to checkout -->
            <router-link
              to="/checkout"
              class="btn btn-primary btn-lg w-full rounded-xl font-bold shadow-sm"
            >
              Proceed to Checkout →
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCartStore } from '../stores/cart'

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

