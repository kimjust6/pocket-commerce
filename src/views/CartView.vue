<template>
  <div class="py-12 bg-base-100 min-h-screen">
    <div class="container mx-auto px-4 md:px-8 max-w-7xl">
      <!-- Breadcrumbs -->
      <Breadcrumbs :items="[{ label: 'Home', to: '/' }, { label: 'Shopping Cart' }]" />

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
          <CartItemRow
            v-for="item in cartStore.items"
            :key="item.id"
            :item="item"
            mode="table"
            @update-quantity="cartStore.updateQuantity"
            @remove="cartStore.removeFromCart"
          />

          <!-- Bottom Actions -->
          <div class="flex justify-between items-center pt-2">
            <router-link to="/shop" class="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              ← Continue Shopping
            </router-link>
            <button
              type="button"
              @click="cartStore.clearCart"
              class="text-xs font-semibold text-error hover:underline"
            >
              Clear Entire Cart
            </button>
          </div>
        </div>

        <!-- Order Summary Column -->
        <div class="lg:col-span-4">
          <OrderSummary>
            <template #actions>
              <router-link
                to="/checkout"
                class="btn btn-primary btn-lg w-full rounded-xl font-bold shadow-sm"
              >
                Proceed to Checkout →
              </router-link>
            </template>
          </OrderSummary>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '../stores/cart'
import Breadcrumbs from '../components/ui/Breadcrumbs.vue'
import CartItemRow from '../components/cart/CartItemRow.vue'
import OrderSummary from '../components/cart/OrderSummary.vue'

const cartStore = useCartStore()
</script>
