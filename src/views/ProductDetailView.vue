<template>
  <div class="py-12 bg-base-100 min-h-screen">
    <div class="container mx-auto px-4 md:px-8 max-w-7xl">
      <!-- Breadcrumbs -->
      <Breadcrumbs :items="breadcrumbItems" />

      <!-- Loading skeleton -->
      <div v-if="loading" class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div class="skeleton h-96 w-full rounded-2xl"></div>
        <div class="space-y-4">
          <div class="skeleton h-8 w-3/4"></div>
          <div class="skeleton h-6 w-1/4"></div>
          <div class="skeleton h-32 w-full"></div>
        </div>
      </div>

      <!-- Product NotFound -->
      <div v-else-if="!product" class="text-center py-20 space-y-4">
        <Mail class="w-12 h-12 text-base-content/30 mx-auto" />
        <h2 class="text-2xl font-extrabold text-base-content">Greeting Card Not Found</h2>
        <p class="text-sm text-base-content/60">The card you are looking for does not exist or has been retired.</p>
        <router-link to="/shop" class="btn btn-primary rounded-xl font-bold">
          Back to Shop
        </router-link>
      </div>

      <!-- Product Details Content -->
      <div v-else class="space-y-16">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <!-- Left: Image Gallery -->
          <div class="lg:col-span-6 space-y-4">
            <div class="border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden bg-base-200/40 aspect-square shadow-sm">
              <img
                :src="selectedImage || product.primaryImage"
                :alt="product.name"
                class="w-full h-full object-cover transition-all duration-300"
              />
            </div>

            <!-- Thumbnail carousel -->
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

          <!-- Right: Product Info & Actions -->
          <div class="lg:col-span-6 space-y-6">
            <div class="space-y-2">
              <span class="badge badge-primary font-bold text-xs uppercase tracking-wider py-3 px-3">
                {{ product.categoryName }}
              </span>

              <h1 class="text-3xl sm:text-4xl font-extrabold text-base-content tracking-tight leading-tight">
                {{ product.name }}
              </h1>

              <!-- Star Rating -->
              <div class="flex items-center gap-3 pt-1">
                <RatingStars :value="5" size="sm" />
                <span class="text-xs text-base-content/70 font-semibold">
                  5.0 ({{ product.reviews?.length || 4 }} customer reviews)
                </span>
              </div>
            </div>

            <!-- Price -->
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

            <!-- Description -->
            <p class="text-sm text-base-content/75 leading-relaxed font-medium">
              {{ product.description }}
            </p>

            <!-- Variants selector -->
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

            <!-- Quantity & CTA Buttons -->
            <div class="space-y-4 pt-2">
              <div class="flex items-center gap-4">
                <label class="text-xs font-bold text-base-content">Quantity:</label>
                <div class="join border border-slate-200 dark:border-slate-700 rounded-xl bg-base-100">
                  <button
                    type="button"
                    @click="quantity = Math.max(1, quantity - 1)"
                    class="join-item btn btn-ghost btn-sm px-3"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span class="join-item px-4 py-1 text-sm font-bold flex items-center">
                    {{ quantity }}
                  </span>
                  <button
                    type="button"
                    @click="quantity++"
                    class="join-item btn btn-ghost btn-sm px-3"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
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

            <!-- Product Perks / Details -->
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

        <!-- Customer Reviews Section -->
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

    <!-- Reusable Review Modal -->
    <Modal
      :is-open="showReviewModal"
      title="Write a Review"
      @close="showReviewModal = false"
    >
      <form @submit.prevent="submitReview" id="review-form" class="space-y-4">
        <div>
          <label class="text-xs font-bold text-base-content block mb-1">Your Rating</label>
          <div class="flex items-center gap-2">
            <RatingStars
              v-model="newReview.rating"
              size="md"
              :interactive="true"
            />
            <span class="text-xs font-bold text-base-content/60">{{ newReview.rating }} of 5 Stars</span>
          </div>
        </div>

        <div>
          <label class="text-xs font-bold text-base-content block mb-1">Title</label>
          <input
            v-model="newReview.title"
            type="text"
            placeholder="e.g. Loved this hilarious card!"
            required
            class="input input-bordered input-sm w-full rounded-xl text-xs"
          />
        </div>

        <div>
          <label class="text-xs font-bold text-base-content block mb-1">Review</label>
          <textarea
            v-model="newReview.body"
            rows="3"
            placeholder="What made this greeting card special?"
            required
            class="textarea textarea-bordered w-full rounded-xl text-xs"
          ></textarea>
        </div>
      </form>

      <template #actions>
        <button
          type="button"
          @click="showReviewModal = false"
          class="btn btn-ghost btn-sm rounded-xl font-bold"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="review-form"
          :disabled="submittingReview"
          class="btn btn-primary btn-sm rounded-xl font-bold"
        >
          {{ submittingReview ? 'Submitting...' : 'Submit Review' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Mail, Leaf, Ruler } from 'lucide-vue-next'
import { getProduct, createReview } from '../services/pocketbase'
import { useCartStore } from '../stores/cart'
import { useToastStore } from '../stores/toast'
import { formatPrice } from '../utils/formatters'
import ReviewCard from '../components/products/ReviewCard.vue'
import RatingStars from '../components/ui/RatingStars.vue'
import Breadcrumbs from '../components/ui/Breadcrumbs.vue'
import Modal from '../components/ui/Modal.vue'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const toastStore = useToastStore()

const loading = ref(true)
const product = ref(null)
const selectedImage = ref('')
const selectedVariant = ref(null)
const quantity = ref(1)

const showReviewModal = ref(false)
const submittingReview = ref(false)
const newReview = ref({
  rating: 5,
  title: '',
  body: '',
})

const currentPrice = computed(() => {
  return selectedVariant.value?.price || product.value?.price || 4.99
})

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

async function loadProduct() {
  loading.value = true
  try {
    const slug = route.params.slug
    const res = await getProduct(slug)
    product.value = res
    if (res) {
      selectedImage.value = res.primaryImage
      if (res.variants?.length > 0) {
        selectedVariant.value = res.variants[0]
      }
    }
  } catch (err) {
    console.error('Error fetching product:', err)
  } finally {
    loading.value = false
  }
}

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

async function submitReview() {
  if (!product.value) return
  submittingReview.value = true
  try {
    await createReview({
      product: product.value.id,
      rating: newReview.value.rating,
      title: newReview.value.title,
      body: newReview.value.body,
      is_verified_purchase: true,
    })
    toastStore.success('Thank you! Your review was submitted.')
    showReviewModal.value = false
    newReview.value = { rating: 5, title: '', body: '' }
    await loadProduct()
  } catch (err) {
    console.error('Error submitting review:', err)
    toastStore.error('Could not submit review. Please try again.')
  } finally {
    submittingReview.value = false
  }
}

onMounted(() => {
  loadProduct()
})
</script>
