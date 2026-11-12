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
              <Menu class="h-5 w-5" />
            </button>
            <ul
              v-if="isMobileMenuOpen"
              class="menu menu-sm dropdown-content mt-3 z-50 p-2 shadow-xl bg-base-100 rounded-box w-56 border border-slate-200/80 dark:border-slate-800 space-y-1"
            >
              <li><router-link to="/" @click="isMobileMenuOpen = false">Home</router-link></li>
              <li><router-link to="/shop" @click="isMobileMenuOpen = false">All Cards</router-link></li>
              <li class="menu-title text-xs">Categories</li>
              <li v-for="cat in CATEGORY_LINKS" :key="cat.slug">
                <router-link :to="`/shop?category=${cat.slug}`" @click="isMobileMenuOpen = false">
                  {{ cat.shortLabel }}
                </router-link>
              </li>
            </ul>
          </div>

          <!-- Brand Logo -->
          <router-link to="/" class="flex items-center gap-2 text-xl sm:text-2xl font-black text-base-content tracking-tight">
            <span class="p-2 bg-primary text-primary-content rounded-xl shadow-xs flex items-center justify-center">
              <Mail class="w-5 h-5" />
            </span>
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
              <ChevronDown class="h-4 w-4" />
            </div>
            <ul tabindex="0" class="dropdown-content z-50 menu p-2 shadow-xl bg-base-100 rounded-box w-52 border border-slate-200/80 dark:border-slate-800">
              <li v-for="cat in CATEGORY_LINKS" :key="cat.slug">
                <router-link :to="`/shop?category=${cat.slug}`">{{ cat.label }}</router-link>
              </li>
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
              <Search class="h-4 w-4" />
            </button>
          </form>

          <!-- Theme toggle -->
          <button
            type="button"
            @click="themeStore.toggleTheme"
            class="btn btn-ghost btn-circle btn-sm"
            aria-label="Toggle dark/light theme"
          >
            <Sun v-if="themeStore.currentTheme === 'dark'" class="w-4 h-4 text-amber-400" />
            <Moon v-else class="w-4 h-4 text-slate-600" />
          </button>

          <!-- Cart Drawer Button -->
          <button
            @click="cartStore.isDrawerOpen = true"
            class="btn btn-ghost btn-circle btn-sm relative"
            aria-label="Open shopping cart"
          >
            <ShoppingCart class="h-5 w-5" />
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
import { Mail, Sun, Moon, Menu, ChevronDown, Search, ShoppingCart } from 'lucide-vue-next'
import { CATEGORY_LINKS } from '../../constants/navigation'
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

