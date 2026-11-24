<template>
  <div class="py-12 bg-base-100 min-h-screen">
    <div class="container mx-auto px-4 md:px-8 max-w-7xl">
      <Breadcrumbs :items="breadcrumbItems" />

      <div v-if="loading" class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div class="skeleton h-96 w-full rounded-2xl"></div>
        <div class="space-y-4">
          <div class="skeleton h-8 w-3/4"></div>
          <div class="skeleton h-6 w-1/4"></div>
          <div class="skeleton h-32 w-full"></div>
        </div>
      </div>

      <div v-else-if="!product" class="text-center py-20 space-y-4">
        <Mail class="w-12 h-12 text-base-content/30 mx-auto" />
        <h2 class="text-2xl font-extrabold text-base-content">Greeting Card Not Found</h2>
        <p class="text-sm text-base-content/60">The card you are looking for does not exist or has been retired.</p>
        <router-link to="/shop" class="btn btn-primary rounded-xl font-bold">
          Back to Shop
        </router-link>
      </div>

      <div v-else class="space-y-16">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div class="lg:col-span-6 space-y-4">
            <div class="border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden bg-base-200/40 aspect-square shadow-sm">
              <img
                :src="selectedImage || product.primaryImage"
                :alt="product.name"
                class="w-full h-full object-cover transition-all duration-300"
              />
            </div>

            <div v-if="product.images?.length > 1" class="flex gap-3 overflow-x-auto pb-2">
              <button
                v-for="(img, idx) in product.images"
                :key="idx"
                type="button"
                @click="selectedImage = img"
                :class="[
                  'w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all',
                  selectedImage === img ? 'border-primary shadow-sm scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                ]"
                :aria-label="`Thumbnail ${idx + 1}`"
              >
                <img :src="img" :alt="product.name" class="w-full h-full object-cover" />
              </button>
            </div>
          </div>

          <div class="lg:col-span-6 space-y-6">
            <div class="space-y-2">
              <span class="badge badge-primary font-bold text-xs uppercase tracking-wider py-3 px-3">
                {{ product.categoryName }}
              </span>

              <h1 class="text-3xl sm:text-4xl font-extrabold text-base-content tracking-tight leading-tight">
                {{ product.name }}
              </h1>

              <div class="flex items-center gap-3 pt-1">
                <RatingStars :value="averageRating" size="sm" />
                <span class="text-xs text-base-content/70 font-semibold">
                  {{ reviewCount > 0 ? `${averageRating.toFixed(1)} (${reviewCount} customer ${reviewCount === 1 ? 'review' : 'reviews'})` : 'No reviews yet' }}
                </span>
              </div>
            </div>

            <div class="flex items-baseline gap-3 py-2 border-y border-slate-100 dark:border-slate-800">
              <span class="text-3xl font-black text-base-content">
                {{ formatPrice(currentPrice) }}
              </span>
              <span
                v-if="product.compareAtPrice && product.compareAtPrice > currentPrice"
                class="text-base text-base-content/40 line-through font-semibold"
              >
                {{ formatPrice(product.compareAtPrice) }}
              </span>
              <span class="badge badge-success badge-outline font-bold text-xs">
                In Stock
              </span>
            </div>

            <p class="text-sm text-base-content/75 leading-relaxed font-medium">
              {{ product.description }}
            </p>

            <div v-if="product.variants?.length > 1" class="space-y-2">
              <label class="text-xs font-bold text-base-content uppercase tracking-wider block">
                Select Option:
              </label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="variant in product.variants"
                  :key="variant.id"
                  type="button"
                  @click="selectedVariant = variant"
                  :class="[
                    'btn btn-sm rounded-xl font-bold text-xs',
                    selectedVariant?.id === variant.id ? 'btn-primary' : 'btn-outline'
                  ]"
                >
                  {{ variant.attributes?.Format || variant.sku || 'Option' }}
                  - {{ formatPrice(variant.price) }}
                </button>
              </div>
            </div>

            <div class="space-y-4 pt-2">
              <div class="flex items-center gap-4">
                <label class="text-xs font-bold text-base-content">Quantity:</label>
                <QuantitySelector
                  :quantity="quantity"
                  :min="1"
                  size="sm"
                  @update="(qty) => (quantity = qty)"
                />
              </div>

              <div class="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  @click="handleAddToCart"
                  class="btn btn-primary btn-lg rounded-xl font-bold flex-1 shadow-sm"
                >
                  Add to Cart • {{ formatPrice(currentPrice * quantity) }}
                </button>
                <button
                  type="button"
                  @click="handleBuyNow"
                  class="btn btn-neutral btn-lg rounded-xl font-bold flex-1"
                >
                  Buy Now
                </button>
              </div>
            </div>

            <div class="p-5 bg-base-200/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3 text-xs">
              <div class="flex items-center gap-3">
                <Leaf class="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <div>
                  <span class="font-bold text-base-content">Eco-Friendly Cardstock:</span>
                  <span class="text-base-content/70 ml-1">Printed on 300gsm 100% post-consumer recycled paper.</span>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <Mail class="w-4 h-4 text-primary flex-shrink-0" />
                <div>
                  <span class="font-bold text-base-content">Kraft Envelope Included:</span>
                  <span class="text-base-content/70 ml-1">Includes a matching natural brown kraft paper envelope.</span>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <Ruler class="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <div>
                  <span class="font-bold text-base-content">Standard Size:</span>
                  <span class="text-base-content/70 ml-1">A2 Greeting Card (4.25" x 5.5" folded). Blank inside.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section class="border-t border-slate-200/80 dark:border-slate-800 pt-12 space-y-8">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 class="text-2xl font-extrabold text-base-content tracking-tight">Customer Reviews</h3>
              <p class="text-xs text-base-content/60 mt-1">Real ratings from verified paper lovers</p>
            </div>
            <button
              type="button"
              @click="showReviewModal = true"
              class="btn btn-outline btn-sm rounded-xl font-bold text-xs"
            >
              Write a Review
            </button>
          </div>

          <div v-if="product.reviews?.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ReviewCard v-for="rev in product.reviews" :key="rev.id" :review="rev" />
          </div>

          <div v-else class="text-center py-8 text-xs text-base-content/60 bg-base-200/40 rounded-2xl p-6">
            No reviews yet for this card. Be the first to share your thoughts!
          </div>
        </section>
      </div>
    </div>

    <ReviewModal
      v-if="product"
      :is-open="showReviewModal"
      :product-id="product.id"
      @close="showReviewModal = false"
      @submitted="loadProduct(route.params.slug)"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Mail, Leaf, Ruler } from 'lucide-vue-next'
import { useCartStore } from '../stores/cart'
import { useToastStore } from '../stores/toast'
import { formatPrice } from '../utils/formatters'
import { useProductDetail } from '../composables/useProductDetail'
import ReviewCard from '../components/products/ReviewCard.vue'
import ReviewModal from '../components/products/ReviewModal.vue'
import RatingStars from '../components/ui/RatingStars.vue'
import Breadcrumbs from '../components/ui/Breadcrumbs.vue'
import QuantitySelector from '../components/ui/QuantitySelector.vue'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const toastStore = useToastStore()

const {
  loading,
  product,
  selectedImage,
  selectedVariant,
  currentPrice,
  reviewCount,
  averageRating,
  loadProduct,
} = useProductDetail()

const quantity = ref(1)
const showReviewModal = ref(false)

const breadcrumbItems = computed(() => {
  const items = [{ label: 'Home', to: '/' }, { label: 'Shop', to: '/shop' }]
  if (product.value?.categoryName) {
    items.push({
      label: product.value.categoryName,
      to: `/shop?category=${product.value.categorySlug}`,
    })
  }
  items.push({ label: product.value?.name || 'Card Details' })
  return items
})

function handleAddToCart() {
  if (!product.value) return
  cartStore.addToCart(product.value, selectedVariant.value, quantity.value)
  toastStore.success(`Added ${quantity.value} "${product.value.name}" to cart!`)
}

function handleBuyNow() {
  if (!product.value) return
  cartStore.addToCart(product.value, selectedVariant.value, quantity.value)
  cartStore.isDrawerOpen = false
  router.push('/checkout')
}

onMounted(() => {
  loadProduct(route.params.slug)
})

watch(
  () => route.params.slug,
  (newSlug, oldSlug) => {
    if (newSlug && newSlug !== oldSlug) {
      loadProduct(newSlug)
    }
  }
)
</script>
