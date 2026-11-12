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
            <span class="badge badge-outline text-xs font-semibold py-3 px-3 gap-1.5">
              <Leaf class="w-3.5 h-3.5 text-emerald-500" />
              100% Recycled Paper
            </span>
            <span class="badge badge-outline text-xs font-semibold py-3 px-3 gap-1.5">
              <Truck class="w-3.5 h-3.5 text-primary" />
              Fast Shipping
            </span>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="space-y-3">
          <h4 class="text-xs font-bold uppercase tracking-wider text-base-content">Shop Cards</h4>
          <ul class="space-y-2 text-sm text-base-content/70 font-medium">
            <li><router-link to="/shop?category=birthday" class="hover:text-primary transition-colors">Birthday Cards</router-link></li>
            <li><router-link to="/shop?category=animals" class="hover:text-primary transition-colors">Animals & Pets</router-link></li>
            <li><router-link to="/shop?category=food" class="hover:text-primary transition-colors">Food & Drink Puns</router-link></li>
            <li><router-link to="/shop?category=love" class="hover:text-primary transition-colors">Love & Romance</router-link></li>
            <li><router-link to="/shop?category=thank-you" class="hover:text-primary transition-colors">Thank You Notes</router-link></li>
          </ul>
        </div>

        <!-- Account / Help -->
        <div class="space-y-3">
          <h4 class="text-xs font-bold uppercase tracking-wider text-base-content">Account & Help</h4>
          <ul class="space-y-2 text-sm text-base-content/70 font-medium">
            <li><router-link to="/cart" class="hover:text-primary transition-colors">Shopping Cart</router-link></li>
            <li><router-link to="/account" class="hover:text-primary transition-colors">Order History</router-link></li>
            <li><router-link to="/profile" class="hover:text-primary transition-colors">Account Settings</router-link></li>
            <li><router-link to="/login" class="hover:text-primary transition-colors">Sign In</router-link></li>
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

const newsletterEmail = ref('')
const subscribed = ref(false)

function handleNewsletter() {
  if (newsletterEmail.value) {
    subscribed.value = true
    newsletterEmail.value = ''
  }
}
</script>

