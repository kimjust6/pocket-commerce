<template>
  <div>
    <!-- Hero Banner Section -->
    <section class="bg-base-200/50 py-16 md:py-24 border-b border-slate-200/70 dark:border-slate-800 transition-colors">
      <div class="container mx-auto px-4 md:px-8 max-w-7xl">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <!-- Hero Left Copy -->
          <div class="lg:col-span-7 space-y-6 text-center lg:text-left">
            <span class="text-xs font-bold uppercase tracking-wider text-primary inline-block bg-primary/10 px-3 py-1 rounded-full">
              Handcrafted Stationery
            </span>

            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-base-content tracking-tight leading-tight">
              Greeting Cards for Every Celebration
            </h1>

            <p class="text-base sm:text-lg text-base-content/70 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Explore our collection of funny, thoughtful, and custom-illustrated cards printed locally on 100% recycled paper stock.
            </p>

            <div class="flex flex-wrap justify-center lg:justify-start gap-4 pt-2">
              <router-link to="/shop" class="btn btn-primary btn-lg rounded-xl font-bold px-8 shadow-sm">
                Shop All Cards
              </router-link>
              <router-link to="/shop?category=birthday" class="btn btn-outline btn-lg rounded-xl font-bold px-7">
                Birthday Cards
              </router-link>
            </div>
          </div>

          <!-- Hero Right Showcase Card -->
          <div class="lg:col-span-5 flex justify-center lg:justify-end">
            <div class="card w-full max-w-sm bg-base-100 border border-slate-200/80 dark:border-slate-800 shadow-md">
              <figure class="px-4 pt-4">
                <img
                  src="/hero-greeting-card.webp"
                  alt="Featured Card"
                  class="rounded-xl h-72 w-full object-cover"
                />
              </figure>
              <div class="card-body p-5 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-primary uppercase tracking-wider">Featured Design</span>
                  <span class="text-xs font-bold text-amber-500">★ 5.0</span>
                </div>
                <h3 class="card-title text-base font-bold text-base-content leading-snug">
                  Hilarious Toast Greeting Card
                </h3>
                <div class="card-actions justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span class="text-lg font-bold text-base-content">$4.99</span>
                  <router-link to="/shop/card/hilarious-toast-birthday-card" class="btn btn-primary btn-sm rounded-xl font-bold px-5">
                    View Item
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Best Sellers Section -->
    <section class="py-16 bg-base-100 transition-colors">
      <div class="container mx-auto px-4 md:px-8 max-w-7xl">
        <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
          <div>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight">
              Best Sellers
            </h2>
            <p class="text-xs text-base-content/60 mt-1">Our most popular greeting cards</p>
          </div>
          <router-link to="/shop" class="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            View All Cards →
          </router-link>
        </div>

        <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <ProductCardSkeleton v-for="n in 4" :key="n" />
        </div>

        <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <ProductCard v-for="card in bestSellers" :key="card.id" :product="card" />
        </div>
      </div>
    </section>

    <!-- Shop by Category Section -->
    <section class="py-16 bg-base-200/40 border-t border-slate-200/70 dark:border-slate-800 transition-colors">
      <div class="container mx-auto px-4 md:px-8 max-w-7xl">
        <div class="mb-10">
          <h2 class="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight">Shop by Category</h2>
          <p class="text-xs text-base-content/60 mt-1">Browse cards tailored to your special event</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <router-link
            v-for="cat in featuredCategories"
            :key="cat.slug"
            :to="`/shop?category=${cat.slug}`"
            class="block group"
          >
            <div class="card card-side bg-base-100 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-300 p-4 items-center">
              <figure class="w-16 h-16 rounded-xl bg-base-200 overflow-hidden flex-shrink-0">
                <img
                  :src="cat.image"
                  :alt="cat.name"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </figure>
              <div class="card-body p-3 pl-4 justify-center">
                <h3 class="font-bold text-sm text-base-content group-hover:text-primary transition-colors">
                  {{ cat.name }}
                </h3>
                <p class="text-[11px] text-base-content/60 line-clamp-1">
                  {{ cat.desc }}
                </p>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Features Banner Section -->
    <section class="py-16 bg-base-100 transition-colors">
      <div class="container mx-auto px-4 md:px-8 max-w-7xl">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="p-6 rounded-2xl bg-base-200/50 border border-slate-200/80 dark:border-slate-800 space-y-3"
          >
            <div :class="['inline-flex p-2.5 rounded-xl', feature.iconBgClass]">
              <component :is="feature.icon" class="w-6 h-6" />
            </div>
            <h3 class="font-extrabold text-base text-base-content">{{ feature.title }}</h3>
            <p class="text-xs text-base-content/70 leading-relaxed">
              {{ feature.desc }}
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Leaf, Palette, Truck } from 'lucide-vue-next'
import { getProducts, getCategories } from '../services/pocketbase'
import ProductCard from '../components/products/ProductCard.vue'
import ProductCardSkeleton from '../components/products/ProductCardSkeleton.vue'

const loading = ref(true)
const bestSellers = ref([])
const categories = ref([])

const featuredCategories = [
  { name: 'Birthday Cards', slug: 'birthday', image: '/card-birthday.webp', desc: 'Punny cards for everyone turning a year older.' },
  { name: 'Animals & Pets', slug: 'animals', image: '/card-animals.webp', desc: 'Hilarious greetings featuring cute critters.' },
  { name: 'Food & Drink', slug: 'food', image: '/card-food.webp', desc: 'Deliciously funny cards for foodies.' },
  { name: 'Love & Romance', slug: 'love', image: '/card-love.webp', desc: 'Romantic puns to make your partner smile.' },
]

const features = [
  {
    title: '100% Recycled Paper',
    desc: 'Every card is printed with non-toxic soy ink on post-consumer recycled premium cardstock.',
    icon: Leaf,
    iconBgClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  {
    title: 'Handcrafted Original Art',
    desc: 'Designed by independent illustrators, offering unique craftsmanship you will not find in mass-market stores.',
    icon: Palette,
    iconBgClass: 'bg-primary/10 text-primary',
  },
  {
    title: 'Fast Shipping',
    desc: 'Orders ship within 24 hours in rigid protective mailers to ensure every card arrives in pristine condition.',
    icon: Truck,
    iconBgClass: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  },
]

onMounted(async () => {
  try {
    const [productsRes, categoriesRes] = await Promise.all([
      getProducts({ perPage: 8 }),
      getCategories(),
    ])
    bestSellers.value = productsRes.items
    categories.value = categoriesRes
  } catch (err) {
    console.error('Home data load error:', err)
  } finally {
    loading.value = false
  }
})
</script>

