<template>
  <header class="sticky top-0 z-40 bg-base-100/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
    <div class="container mx-auto px-4 md:px-8 max-w-7xl">
      <div class="navbar min-h-[4rem] px-0 gap-2">
        <!-- Mobile hamburger -->
        <div class="navbar-start lg:w-auto">
          <div class="dropdown lg:hidden">
            <button
              tabindex="0"
              class="btn btn-ghost btn-circle"
              aria-label="Toggle navigation menu"
              @click="isMobileMenuOpen = !isMobileMenuOpen"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </button>
            <ul
              v-if="isMobileMenuOpen"
              class="menu menu-sm dropdown-content mt-3 z-50 p-2 shadow-xl bg-base-100 rounded-box w-56 border border-slate-200/80 dark:border-slate-800 space-y-1"
            >
              <li><router-link to="/" @click="isMobileMenuOpen = false">Home</router-link></li>
              <li><router-link to="/shop" @click="isMobileMenuOpen = false">All Cards</router-link></li>
              <li class="menu-title text-xs">Categories</li>
              <li><router-link to="/shop?category=birthday" @click="isMobileMenuOpen = false">Birthday</router-link></li>
              <li><router-link to="/shop?category=animals" @click="isMobileMenuOpen = false">Animals</router-link></li>
              <li><router-link to="/shop?category=food" @click="isMobileMenuOpen = false">Food & Drink</router-link></li>
              <li><router-link to="/shop?category=love" @click="isMobileMenuOpen = false">Love & Romance</router-link></li>
              <li><router-link to="/shop?category=thank-you" @click="isMobileMenuOpen = false">Thank You</router-link></li>
            </ul>
          </div>

          <!-- Brand Logo -->
          <router-link to="/" class="flex items-center gap-2 text-xl sm:text-2xl font-black text-base-content tracking-tight">
            <span class="p-1.5 bg-primary text-primary-content rounded-xl shadow-xs">💌</span>
            <span>Pocket<span class="text-primary">Commerce</span></span>
          </router-link>
        </div>

        <!-- Desktop Navigation Links -->
        <div class="navbar-center hidden lg:flex items-center gap-6">
          <router-link to="/shop" class="text-sm font-bold text-base-content/80 hover:text-primary transition-colors">
            All Cards
          </router-link>

          <div class="dropdown dropdown-hover">
            <div tabindex="0" role="button" class="text-sm font-bold text-base-content/80 hover:text-primary transition-colors flex items-center gap-1 cursor-pointer">
              Categories
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <ul tabindex="0" class="dropdown-content z-50 menu p-2 shadow-xl bg-base-100 rounded-box w-52 border border-slate-200/80 dark:border-slate-800">
              <li><router-link to="/shop?category=birthday">Birthday Cards</router-link></li>
              <li><router-link to="/shop?category=animals">Animals & Pets</router-link></li>
              <li><router-link to="/shop?category=food">Food & Drink Puns</router-link></li>
              <li><router-link to="/shop?category=love">Love & Romance</router-link></li>
              <li><router-link to="/shop?category=thank-you">Thank You Notes</router-link></li>
            </ul>
          </div>
        </div>

        <!-- Navbar End Actions -->
        <div class="navbar-end flex items-center gap-2 sm:gap-3 flex-1 justify-end">
          <!-- Search input -->
          <form @submit.prevent="handleSearch" class="relative hidden sm:block w-40 md:w-56">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search cards..."
              class="input input-sm input-bordered w-full rounded-xl pr-8 bg-base-200/50 text-xs focus:bg-base-100"
            />
            <button type="submit" class="absolute right-2.5 top-2 text-base-content/50 hover:text-primary" aria-label="Search">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          <!-- Theme toggle -->
          <button
            @click="themeStore.toggleTheme"
            class="btn btn-ghost btn-circle btn-sm"
            aria-label="Toggle dark/light theme"
          >
            <span v-if="themeStore.currentTheme === 'dark'" class="text-amber-400">☀️</span>
            <span v-else class="text-slate-600">🌙</span>
          </button>

          <!-- Cart Drawer Button -->
          <button
            @click="cartStore.isDrawerOpen = true"
            class="btn btn-ghost btn-circle btn-sm relative"
            aria-label="Open shopping cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span
              v-if="cartStore.totalItems > 0"
              class="badge badge-primary badge-xs absolute -top-0.5 -right-0.5 font-bold px-1.5 py-2 text-[10px]"
            >
              {{ cartStore.totalItems }}
            </span>
          </button>

          <!-- User Menu -->
          <div v-if="authStore.isAuthenticated" class="dropdown dropdown-end">
            <button tabindex="0" class="btn btn-ghost btn-circle btn-sm avatar">
              <div class="w-8 rounded-full ring-2 ring-primary/30">
                <img :src="authStore.avatarUrl" :alt="authStore.user?.username || 'User'" />
              </div>
            </button>
            <ul
              tabindex="0"
              class="menu menu-sm dropdown-content mt-3 z-50 p-2 shadow-xl bg-base-100 rounded-box w-52 border border-slate-200/80 dark:border-slate-800"
            >
              <li class="px-3 py-1 font-bold text-xs text-base-content/60 border-b border-slate-100 dark:border-slate-800">
                Signed in as {{ authStore.user?.username || authStore.user?.email }}
              </li>
              <li><router-link to="/account">My Orders</router-link></li>
              <li><router-link to="/profile">Profile Settings</router-link></li>
              <li class="border-t border-slate-100 dark:border-slate-800">
                <button @click="handleLogout" class="text-error font-semibold">Logout</button>
              </li>
            </ul>
          </div>

          <div v-else class="flex items-center gap-2">
            <router-link to="/login" class="btn btn-ghost btn-sm rounded-xl font-bold text-xs">
              Sign In
            </router-link>
            <router-link to="/register" class="btn btn-primary btn-sm rounded-xl font-bold text-xs shadow-xs hidden sm:inline-flex">
              Sign Up
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useCartStore } from '../../stores/cart'
import { useThemeStore } from '../../stores/theme'
import { useToastStore } from '../../stores/toast'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()
const themeStore = useThemeStore()
const toastStore = useToastStore()

const searchQuery = ref('')
const isMobileMenuOpen = ref(false)

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({ path: '/shop', query: { search: searchQuery.value.trim() } })
  }
}

function handleLogout() {
  authStore.logout()
  toastStore.show('You have been signed out.')
  router.push('/')
}
</script>

