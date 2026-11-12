<template>
  <div class="py-20 bg-base-100 min-h-screen flex items-center justify-center text-center">
    <div class="container mx-auto px-4 max-w-md space-y-6">
      <div class="text-7xl">📬</div>
      <span class="badge badge-error badge-outline font-black text-sm px-4 py-3">
        404 ERROR
      </span>
      <h1 class="text-4xl font-black text-base-content tracking-tight">
        Page Not Found
      </h1>
      <p class="text-sm text-base-content/70 leading-relaxed">
        The card or page you were looking for seems to have been lost in the mail.
      </p>
      <div class="flex justify-center gap-3 pt-2">
        <router-link to="/" class="btn btn-primary rounded-xl font-bold px-6 shadow-sm">
          Return Home
        </router-link>
        <router-link to="/shop" class="btn btn-outline rounded-xl font-bold px-6">
          Browse Cards
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

