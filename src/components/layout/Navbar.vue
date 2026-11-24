<template>
  <header class="sticky top-0 z-40 bg-base-100/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-colors">
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
          <router-link to="/" class="flex items-center gap-2.5 text-xl sm:text-2xl font-serif font-bold text-base-content tracking-tight">
            <span class="p-2 bg-primary text-primary-content rounded-xl shadow-xs flex items-center justify-center">
              <Mail class="w-5 h-5" />
            </span>
            <span>Pocket<span class="italic text-primary">Commerce</span></span>
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
          <!-- Quick Search Trigger -->
          <button
            type="button"
            @click="isSearchOpen = true"
            class="btn btn-ghost btn-sm rounded-xl border border-stone-200/80 dark:border-stone-700 bg-base-200/60 hover:bg-base-200 gap-2 px-3 text-xs font-medium text-base-content/70"
            aria-label="Search cards"
          >
            <Search class="h-3.5 w-3.5" />
            <span class="hidden sm:inline">Search cards...</span>
            <kbd class="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-base-100 rounded border border-stone-200/80 dark:border-stone-700">⌘K</kbd>
          </button>

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

  <QuickSearchModal :is-open="isSearchOpen" @close="isSearchOpen = false" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Mail, Sun, Moon, Menu, ChevronDown, Search, ShoppingCart } from 'lucide-vue-next'
import { CATEGORY_LINKS } from '../../constants/navigation'
import { useAuthStore } from '../../stores/auth'
import { useCartStore } from '../../stores/cart'
import { useThemeStore } from '../../stores/theme'
import { useToastStore } from '../../stores/toast'
import QuickSearchModal from './QuickSearchModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()
const themeStore = useThemeStore()
const toastStore = useToastStore()

const isSearchOpen = ref(false)
const isMobileMenuOpen = ref(false)

function onKeyDown(e) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    isSearchOpen.value = !isSearchOpen.value
  } else if (e.key === 'Escape' && isSearchOpen.value) {
    isSearchOpen.value = false
  }
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))

function handleLogout() {
  authStore.logout()
  toastStore.show('You have been signed out.')
  router.push('/')
}
</script>

