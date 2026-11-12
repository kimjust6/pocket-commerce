<template>
  <footer class="bg-base-200/70 border-t border-slate-200/80 dark:border-slate-800 mt-auto transition-colors">
    <div class="container mx-auto px-4 md:px-8 max-w-7xl py-12 lg:py-16">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        <!-- Brand Summary -->
        <div class="lg:col-span-2 space-y-4">
          <router-link to="/" class="flex items-center gap-2 text-2xl font-black text-base-content">
            <span class="p-2 bg-primary text-primary-content rounded-xl shadow-xs flex items-center justify-center">
              <Mail class="w-5 h-5" />
            </span>
            <span>Pocket<span class="text-primary">Commerce</span></span>
          </router-link>
          <p class="text-sm text-base-content/70 max-w-sm leading-relaxed font-medium">
            Handcrafted, thoughtful, and witty greeting cards printed locally on 100% recycled paper stock. Celebrating life's meaningful moments.
          </p>
          <div class="flex flex-wrap items-center gap-3 pt-2 text-base-content/70">
            <span
              v-for="badge in brandBadges"
              :key="badge.label"
              class="badge badge-outline text-xs font-semibold py-3 px-3 gap-1.5"
            >
              <component :is="badge.icon" :class="['w-3.5 h-3.5', badge.iconClass]" />
              {{ badge.label }}
            </span>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="space-y-3">
          <h4 class="text-xs font-bold uppercase tracking-wider text-base-content">Shop Cards</h4>
          <ul class="space-y-2 text-sm text-base-content/70 font-medium">
            <li v-for="cat in CATEGORY_LINKS" :key="cat.slug">
              <router-link :to="`/shop?category=${cat.slug}`" class="hover:text-primary transition-colors">
                {{ cat.label }}
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Account / Help -->
        <div class="space-y-3">
          <h4 class="text-xs font-bold uppercase tracking-wider text-base-content">Account & Help</h4>
          <ul class="space-y-2 text-sm text-base-content/70 font-medium">
            <li v-for="link in accountLinks" :key="link.to">
              <router-link :to="link.to" class="hover:text-primary transition-colors">
                {{ link.label }}
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Newsletter Signup -->
        <div class="space-y-3">
          <h4 class="text-xs font-bold uppercase tracking-wider text-base-content">Stay in the Loop</h4>
          <p class="text-xs text-base-content/70">
            Receive special promotions, new card releases, and seasonal updates directly in your inbox.
          </p>
          <form @submit.prevent="handleNewsletter" class="space-y-2">
            <div class="join w-full">
              <input
                v-model="newsletterEmail"
                type="email"
                placeholder="your@email.com"
                required
                class="input input-sm input-bordered join-item w-full text-xs bg-base-100"
              />
              <button type="submit" class="btn btn-sm btn-primary join-item font-bold text-xs">
                Join
              </button>
            </div>
            <p v-if="subscribed" class="text-xs text-success font-semibold">
              ✓ Thanks for subscribing! Use code WELCOME20 for 20% off.
            </p>
          </form>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-slate-200/80 dark:border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-base-content/60 font-medium">
        <p>© {{ new Date().getFullYear() }} Pocket Commerce. All rights reserved. Self-hosted on PocketBase.</p>
        <div class="flex items-center gap-6">
          <router-link to="/shop" class="hover:underline">Catalog</router-link>
          <router-link to="/cart" class="hover:underline">Cart</router-link>
          <a href="https://pocketbase.io" target="_blank" rel="noopener" class="hover:underline">Powered by PocketBase</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref } from 'vue'
import { Mail, Leaf, Truck } from 'lucide-vue-next'
import { CATEGORY_LINKS } from '../../constants/navigation'

const brandBadges = [
  { label: '100% Recycled Paper', icon: Leaf, iconClass: 'text-emerald-500' },
  { label: 'Fast Shipping', icon: Truck, iconClass: 'text-primary' },
]

const accountLinks = [
  { to: '/cart', label: 'Shopping Cart' },
  { to: '/account', label: 'Order History' },
  { to: '/profile', label: 'Account Settings' },
  { to: '/login', label: 'Sign In' },
]

const newsletterEmail = ref('')
const subscribed = ref(false)

function handleNewsletter() {
  if (newsletterEmail.value) {
    subscribed.value = true
    newsletterEmail.value = ''
  }
}
</script>

