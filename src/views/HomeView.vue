<template>
  <div>
    <!-- Editorial Stationery Lookbook Hero -->
    <section class="paper-texture bg-base-200/70 py-16 md:py-24 border-b border-stone-200/80 dark:border-stone-800 overflow-hidden transition-colors">
      <div class="container mx-auto px-4 md:px-8 max-w-7xl">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <!-- Hero Left Copy -->
          <div class="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20">
              <span class="script-font text-sm normal-case tracking-normal">Small-Batch</span>
              <span>·</span>
              <span>Handcrafted Stationery</span>
            </div>

            <h1 class="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-base-content tracking-tight leading-[1.1]">
              Greeting Cards <span class="italic font-normal text-primary">for Every</span> Celebration
            </h1>

            <p class="text-base sm:text-lg text-base-content/75 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Funny, thoughtful, and custom-illustrated cards printed locally with soy ink on 300gsm 100% recycled cotton paper.
            </p>

            <div class="flex flex-wrap justify-center lg:justify-start gap-4 pt-2">
              <router-link to="/shop" class="btn btn-primary btn-lg rounded-xl font-bold px-8 shadow-sm">
                Shop All Cards
              </router-link>
              <router-link to="/shop?category=birthday" class="btn btn-outline btn-lg rounded-xl font-bold px-7 border-stone-300 dark:border-stone-700">
                Birthday Cards
              </router-link>
            </div>

            <!-- Studio Spec Strip -->
            <div class="pt-4 flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 text-xs font-semibold text-base-content/60">
              <span>300gsm Recycled Stock</span>
              <span>•</span>
              <span>Kraft Envelope Included</span>
              <span>•</span>
              <span>Ships in 24h</span>
            </div>
          </div>

          <!-- Hero Right: Overlapping Fanned Card Stack -->
          <div class="lg:col-span-6 flex justify-center lg:justify-end">
            <div class="relative w-full max-w-md py-6 px-4">
              <!-- Back Left Card -->
              <div class="hidden sm:block absolute left-0 top-10 w-52 bg-base-100 border border-stone-200/90 dark:border-stone-800 rounded-2xl p-2.5 shadow-md -rotate-6 opacity-90">
                <img
                  src="/card-animals.webp"
                  alt="Animals greeting card"
                  class="rounded-xl h-56 w-full object-cover"
                />
              </div>

              <!-- Back Right Card -->
              <div class="hidden sm:block absolute right-0 top-12 w-52 bg-base-100 border border-stone-200/90 dark:border-stone-800 rounded-2xl p-2.5 shadow-md rotate-6 opacity-90">
                <img
                  src="/card-love.webp"
                  alt="Love greeting card"
                  class="rounded-xl h-56 w-full object-cover"
                />
              </div>

              <!-- Center Featured Card -->
              <div class="relative z-10 mx-auto w-72 sm:w-80 bg-base-100 border border-stone-200/90 dark:border-stone-800 rounded-3xl shadow-xl p-3.5 hover:-translate-y-1 transition-transform duration-300">
                <div class="overflow-hidden rounded-2xl bg-base-200">
                  <img
                    src="/hero-greeting-card.webp"
                    alt="Featured Card"
                    class="h-72 w-full object-cover"
                  />
                </div>
                <div class="pt-4 px-1.5 pb-1 space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-[11px] font-bold text-primary uppercase tracking-wider">Featured Print</span>
                    <span class="script-font text-base text-accent">Studio Favorite</span>
                  </div>
                  <h3 class="font-serif text-lg font-bold text-base-content leading-snug">
                    Hilarious Toast Greeting Card
                  </h3>
                  <div class="flex justify-between items-center pt-2 border-t border-stone-200/70 dark:border-stone-800">
                    <span class="text-lg font-extrabold text-base-content">$4.99</span>
                    <router-link to="/shop/card/hilarious-toast-birthday-card" class="btn btn-primary btn-sm rounded-xl font-bold px-5">
                      View Card
                    </router-link>
                  </div>
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
        <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 pb-4 border-b border-stone-200/70 dark:border-stone-800 gap-4">
          <div>
            <h2 class="font-serif text-3xl sm:text-4xl font-bold text-base-content tracking-tight">
              Best Sellers
            </h2>
            <p class="text-xs text-base-content/60 mt-1">Our most-sent handcrafted greeting cards</p>
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

    <!-- Shop by Occasion Section -->
    <section class="py-16 bg-base-200/60 border-t border-stone-200/70 dark:border-stone-800 transition-colors">
      <div class="container mx-auto px-4 md:px-8 max-w-7xl">
        <div class="mb-10">
          <h2 class="font-serif text-3xl sm:text-4xl font-bold text-base-content tracking-tight">Shop by Occasion</h2>
          <p class="text-xs text-base-content/60 mt-1">Browse cards tailored to every moment</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <router-link
            v-for="cat in featuredCategories"
            :key="cat.slug"
            :to="`/shop?category=${cat.slug}`"
            class="block group"
          >
            <div class="bg-base-100 border border-stone-200/80 dark:border-stone-800 rounded-2xl shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-4 flex items-center gap-4">
              <div class="w-16 h-20 rounded-xl bg-base-200 overflow-hidden flex-shrink-0 border border-stone-200/60 dark:border-stone-700">
                <img
                  :src="cat.image"
                  :alt="cat.name"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div class="space-y-1 min-w-0">
                <span :class="['inline-block w-2 h-2 rounded-full mr-1.5', cat.dotClass]"></span>
                <h3 class="inline font-serif font-bold text-base text-base-content group-hover:text-primary transition-colors">
                  {{ cat.name }}
                </h3>
                <p class="text-xs text-base-content/65 line-clamp-2">
                  {{ cat.desc }}
                </p>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Studio Craft Banner Section -->
    <section class="py-16 bg-base-100 transition-colors">
      <div class="container mx-auto px-4 md:px-8 max-w-7xl">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="p-6 rounded-2xl bg-base-200/60 border border-stone-200/80 dark:border-stone-800 space-y-3"
          >
            <div :class="['inline-flex p-2.5 rounded-xl', feature.iconBgClass]">
              <component :is="feature.icon" class="w-6 h-6" />
            </div>
            <h3 class="font-serif font-bold text-lg text-base-content">{{ feature.title }}</h3>
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
import { getProducts, getCategories } from '../services/catalogService'
import ProductCard from '../components/products/ProductCard.vue'
import ProductCardSkeleton from '../components/products/ProductCardSkeleton.vue'

const loading = ref(true)
const bestSellers = ref([])
const categories = ref([])

const featuredCategories = [
  { name: 'Birthday Cards', slug: 'birthday', image: '/card-birthday.webp', desc: 'Punny cards for everyone turning a year older.', dotClass: 'bg-amber-500' },
  { name: 'Animals & Pets', slug: 'animals', image: '/card-animals.webp', desc: 'Hilarious greetings featuring cute critters.', dotClass: 'bg-emerald-600' },
  { name: 'Food & Drink', slug: 'food', image: '/card-food.webp', desc: 'Deliciously funny cards for foodies.', dotClass: 'bg-primary' },
  { name: 'Love & Romance', slug: 'love', image: '/card-love.webp', desc: 'Romantic puns to make your partner smile.', dotClass: 'bg-rose-500' },
]

const features = [
  {
    title: '100% Recycled Paper',
    desc: 'Every card is printed with non-toxic soy ink on post-consumer recycled premium cardstock.',
    icon: Leaf,
    iconBgClass: 'bg-secondary/15 text-secondary',
  },
  {
    title: 'Handcrafted Original Art',
    desc: 'Designed by independent illustrators, offering unique craftsmanship you will not find in mass-market stores.',
    icon: Palette,
    iconBgClass: 'bg-primary/15 text-primary',
  },
  {
    title: 'Fast Shipping',
    desc: 'Orders ship within 24 hours in rigid protective mailers to ensure every card arrives in pristine condition.',
    icon: Truck,
    iconBgClass: 'bg-accent/20 text-accent',
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
