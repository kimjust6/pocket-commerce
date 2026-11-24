<template>
  <div class="store-card group bg-base-100 border border-stone-200/80 dark:border-stone-800 rounded-2xl shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden">
    <!-- Card Thumbnail (A2 Portrait Ratio) -->
    <div class="relative overflow-hidden aspect-[4/5] bg-base-200 p-3">
      <router-link :to="`/shop/card/${product.slug}`" class="block w-full h-full overflow-hidden rounded-xl shadow-xs">
        <img
          :src="product.primaryImage || '/card-birthday.webp'"
          :alt="product.name"
          class="w-full h-full object-cover group-hover:scale-[1.04] group-hover:-rotate-1 transition-transform duration-500"
          loading="lazy"
        />
      </router-link>

      <!-- Category Pill -->
      <span
        v-if="product.categoryName"
        class="store-badge absolute top-5 left-5 bg-base-100/95 backdrop-blur-xs text-primary font-bold shadow-xs text-[10px] border border-stone-200/70 dark:border-stone-700"
      >
        {{ product.categoryName }}
      </span>

      <!-- Discount Badge -->
      <span
        v-if="product.compareAtPrice && product.compareAtPrice > product.price"
        class="store-badge absolute top-5 right-5 bg-primary text-primary-content font-bold text-[10px] shadow-xs"
      >
        SALE
      </span>
    </div>

    <!-- Card Content -->
    <div class="p-4 pt-2 flex flex-col flex-1 justify-between gap-3">
      <div class="space-y-1.5">
        <div class="flex items-center justify-between text-[11px] text-base-content/60 font-medium">
          <span>{{ variantLabel }}</span>
          <span class="text-secondary font-semibold">300gsm Recycled</span>
        </div>

        <router-link
          :to="`/shop/card/${product.slug}`"
          class="font-serif font-bold text-base text-base-content hover:text-primary transition-colors line-clamp-1 leading-snug block"
        >
          {{ product.name }}
        </router-link>

        <p class="text-xs text-base-content/70 line-clamp-2 leading-relaxed">
          {{ product.description }}
        </p>
      </div>

      <!-- Price & Action -->
      <div class="pt-2.5 border-t border-stone-200/70 dark:border-stone-800 flex items-center justify-between gap-2">
        <div class="flex items-baseline gap-1.5">
          <span class="text-base font-extrabold text-base-content">
            {{ formatPrice(product.price) }}
          </span>
          <span
            v-if="product.compareAtPrice && product.compareAtPrice > product.price"
            class="text-xs text-base-content/40 line-through font-medium"
          >
            {{ formatPrice(product.compareAtPrice) }}
          </span>
        </div>

        <button
          type="button"
          @click="handleAddToCart"
          class="btn btn-primary btn-sm rounded-xl font-bold px-3.5 text-xs shadow-xs"
        >
          + Add
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCartStore } from '../../stores/cart'
import { useToastStore } from '../../stores/toast'
import { formatPrice } from '../../utils/formatters'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const cartStore = useCartStore()
const toastStore = useToastStore()

const variantLabel = computed(() => {
  const count = props.product.variants?.length || 0
  if (count > 1) return `${count} Formats`
  return props.product.variants?.[0]?.attributes?.Format || 'Single Card'
})

function handleAddToCart() {
  const defaultVariant = props.product.variants?.[0] || null
  cartStore.addToCart(props.product, defaultVariant, 1)
  toastStore.success(`Added "${props.product.name}" to your cart!`)
}
</script>
