<template>
  <div class="min-h-screen flex flex-col bg-base-100 text-base-content selection:bg-primary selection:text-primary-content">
    <Navbar />
    <main class="flex-1">
      <router-view />
    </main>
    <Footer />
    <CartDrawer />
    <Toast />
  </div>
</template>

<script setup>
import Navbar from './components/layout/Navbar.vue'
import Footer from './components/layout/Footer.vue'
import CartDrawer from './components/cart/CartDrawer.vue'
import Toast from './components/ui/Toast.vue'
</script>

