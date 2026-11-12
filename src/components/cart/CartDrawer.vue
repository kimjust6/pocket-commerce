<template>
  <div v-if="cartStore.isDrawerOpen" class="fixed inset-0 z-50 overflow-hidden">
    <!-- Backdrop -->
    <div
      class="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
      @click="cartStore.isDrawerOpen = false"
    ></div>

    <div class="fixed inset-y-0 right-0 max-w-full flex pl-10">
      <div
        class="w-screen max-w-md bg-base-100 border-l border-slate-200/80 dark:border-slate-800 shadow-2xl flex flex-col"
      >
        <!-- Drawer Header -->
        <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h2 class="text-xl font-extrabold text-base-content tracking-tight">Your Cart</h2>
            <span class="badge badge-primary font-bold text-xs">{{ cartStore.totalItems }}</span>
          </div>
          <button
            type="button"
            @click="cartStore.isDrawerOpen = false"
            class="btn btn-ghost btn-sm btn-circle"
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        <!-- Free shipping progress bar -->
        <div class="bg-base-200/60 px-6 py-3 border-b border-slate-100 dark:border-slate-800 text-xs">
          <div v-if="cartStore.subtotal >= 35" class="text-success font-bold flex items-center gap-1.5">
            <span>🎉</span> You unlocked Free Standard Shipping!
          </div>
          <div v-else class="text-base-content/70">
            Add <span class="font-bold text-primary">{{ formatPrice(35 - cartStore.subtotal) }}</span> more for
            <span class="font-bold">Free Shipping</span>!
            <progress
              class="progress progress-primary w-full mt-2"
              :value="Math.min(100, (cartStore.subtotal / 35) * 100)"
              max="100"
            ></progress>
          </div>
        </div>

        <!-- Cart Items List -->
        <div class="flex-1 overflow-y-auto p-6 space-y-4">
          <div v-if="cartStore.items.length === 0" class="text-center py-12 space-y-4">
            <div class="text-5xl">🛒</div>
            <p class="text-base font-bold text-base-content">Your cart is currently empty</p>
            <p class="text-xs text-base-content/60">Discover our lovely handcrafted stationery cards.</p>
            <router-link
              to="/shop"
              @click="cartStore.isDrawerOpen = false"
              class="btn btn-primary btn-sm rounded-xl font-bold px-6"
            >
              Start Shopping
            </router-link>
          </div>

          <div v-else class="space-y-3">
            <CartItemRow
              v-for="item in cartStore.items"
              :key="item.id"
              :item="item"
              mode="drawer"
              @update-quantity="cartStore.updateQuantity"
              @remove="cartStore.removeFromCart"
            />
          </div>
        </div>

        <!-- Drawer Footer -->
        <div v-if="cartStore.items.length > 0" class="p-6 border-t border-slate-100 dark:border-slate-800 bg-base-100 space-y-4">
          <div class="flex justify-between items-center text-sm">
            <span class="text-base-content/70">Subtotal</span>
            <span class="text-lg font-extrabold text-base-content">{{ formatPrice(cartStore.subtotal) }}</span>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <router-link
              to="/cart"
              @click="cartStore.isDrawerOpen = false"
              class="btn btn-outline rounded-xl font-bold text-sm"
            >
              View Cart
            </router-link>
            <router-link
              to="/checkout"
              @click="cartStore.isDrawerOpen = false"
              class="btn btn-primary rounded-xl font-bold text-sm shadow-sm"
            >
              Checkout
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '../../stores/cart'
import { formatPrice } from '../../utils/formatters'
import CartItemRow from './CartItemRow.vue'

const cartStore = useCartStore()
</script>
