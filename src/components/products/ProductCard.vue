<template>
  <div class="store-card group bg-base-100 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden">
    <!-- Card Thumbnail -->
    <div class="relative overflow-hidden aspect-4/3 bg-base-200">
      <router-link :to="`/shop/card/${product.slug}`" class="block w-full h-full">
        <img
          :src="product.primaryImage || '/card-birthday.webp'"
          :alt="product.name"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </router-link>

      <!-- Category Pill -->
      <span
        v-if="product.categoryName"
        class="store-badge absolute top-3 left-3 bg-base-100/90 dark:bg-base-900/90 backdrop-blur-xs text-primary font-bold shadow-xs text-[10px]"
      >
        {{ product.categoryName }}
      </span>

      <!-- Discount Badge -->
      <span
        v-if="product.compareAtPrice && product.compareAtPrice > product.price"
        class="store-badge absolute top-3 right-3 bg-rose-500 text-white font-bold text-[10px]"
      >
        SALE
      </span>
    </div>

    <!-- Card Content -->
    <div class="p-4 flex flex-col flex-1 justify-between gap-3">
      <div class="space-y-1">
        <div class="flex items-center justify-between text-xs text-base-content/60 font-semibold">
          <span class="text-amber-500 font-bold flex items-center gap-1">★ 5.0</span>
          <span>100% Recycled</span>
        </div>

        <router-link
          :to="`/shop/card/${product.slug}`"
          class="font-bold text-sm text-base-content hover:text-primary transition-colors line-clamp-1 leading-snug block"
        >
          {{ product.name }}
        </router-link>

        <p class="text-xs text-base-content/70 line-clamp-2 leading-relaxed">
          {{ product.description }}
        </p>
      </div>

      <!-- Price & Action -->
      <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <div class="flex items-baseline gap-1.5">
          <span class="text-base font-extrabold text-base-content">
            ${{ Number(product.price).toFixed(2) }}
          </span>
          <span
            v-if="product.compareAtPrice && product.compareAtPrice > product.price"
            class="text-xs text-base-content/40 line-through font-medium"
          >
            ${{ Number(product.compareAtPrice).toFixed(2) }}
          </span>
        </div>

        <button
          @click="handleAddToCart"
          class="btn btn-primary btn-sm rounded-xl font-bold px-3 text-xs shadow-xs"
        >
          + Add
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '../../stores/cart'
import { useToastStore } from '../../stores/toast'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const cartStore = useCartStore()
const toastStore = useToastStore()

function handleAddToCart() {
  const defaultVariant = props.product.variants?.[0] || null
  cartStore.addToCart(props.product, defaultVariant, 1)
  toastStore.success(`Added "${props.product.name}" to your cart!`)
}
</script>

