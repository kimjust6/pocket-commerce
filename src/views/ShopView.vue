<template>
  <div class="py-10 bg-base-100 min-h-screen">
    <div class="container mx-auto px-4 md:px-8 max-w-7xl">
      <!-- Breadcrumb and Title Header -->
      <div class="mb-8">
        <Breadcrumbs :items="[{ label: 'Home', to: '/' }, { label: 'Shop All Cards' }]" />
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 class="text-3xl sm:text-4xl font-extrabold text-base-content tracking-tight">
              Greeting Cards Collection
            </h1>
            <p class="text-xs text-base-content/60 mt-1">
              Showing {{ products.length }} handcrafted designs
            </p>
          </div>

          <!-- Sort dropdown -->
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-base-content/70">Sort by:</span>
            <select
              v-model="selectedSort"
              @change="fetchData"
              class="select select-bordered select-sm rounded-xl text-xs bg-base-100"
            >
              <option value="-created">Newest</option>
              <option value="name">Name: A to Z</option>
              <option value="-name">Name: Z to A</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Active Filters Pills -->
      <div v-if="selectedCategory || searchQuery || minPrice || maxPrice" class="flex flex-wrap items-center gap-2 mb-6">
        <span class="text-xs font-bold text-base-content/60">Active Filters:</span>
        <span v-if="selectedCategory" class="badge badge-primary gap-1 text-xs py-2">
          Category: {{ selectedCategory }}
          <button @click="setCategory(null)">✕</button>
        </span>
        <span v-if="searchQuery" class="badge badge-primary gap-1 text-xs py-2">
          Search: "{{ searchQuery }}"
          <button @click="searchQuery = ''; fetchData()">✕</button>
        </span>
        <span v-if="minPrice || maxPrice" class="badge badge-primary gap-1 text-xs py-2">
          Price: ${{ minPrice || 0 }} - ${{ maxPrice || 'max' }}
          <button @click="minPrice = null; maxPrice = null; fetchData()">✕</button>
        </span>
        <button
          @click="clearAllFilters"
          class="text-xs text-error font-bold hover:underline ml-2"
        >
          Clear All
        </button>
      </div>

      <!-- Main Layout: Sidebar Filters + Products Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Sidebar Filters -->
        <aside class="space-y-6">
          <!-- Categories Filter -->
          <div class="bg-base-200/50 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 class="font-extrabold text-sm text-base-content uppercase tracking-wider">Categories</h3>
            <ul class="space-y-1">
              <li>
                <button
                  @click="setCategory(null)"
                  :class="[
                    'w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between',
                    !selectedCategory ? 'bg-primary text-primary-content font-bold' : 'hover:bg-base-200 text-base-content/80'
                  ]"
                >
                  <span>All Categories</span>
                </button>
              </li>
              <li v-for="cat in categories" :key="cat.slug">
                <button
                  @click="setCategory(cat.slug)"
                  :class="[
                    'w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between',
                    selectedCategory === cat.slug ? 'bg-primary text-primary-content font-bold' : 'hover:bg-base-200 text-base-content/80'
                  ]"
                >
                  <span>{{ cat.name }}</span>
                </button>
              </li>
            </ul>
          </div>

          <!-- Price Range Filter -->
          <div class="bg-base-200/50 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 class="font-extrabold text-sm text-base-content uppercase tracking-wider">Price Range</h3>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="text-[10px] font-bold text-base-content/60 block mb-1">Min ($)</label>
                <input
                  v-model.number="minPrice"
                  type="number"
                  placeholder="0"
                  class="input input-sm input-bordered w-full rounded-xl text-xs"
                />
              </div>
              <div>
                <label class="text-[10px] font-bold text-base-content/60 block mb-1">Max ($)</label>
                <input
                  v-model.number="maxPrice"
                  type="number"
                  placeholder="20"
                  class="input input-sm input-bordered w-full rounded-xl text-xs"
                />
              </div>
            </div>
            <button
              @click="fetchData"
              class="btn btn-outline btn-sm w-full rounded-xl font-bold text-xs"
            >
              Apply Filter
            </button>
          </div>
        </aside>

        <!-- Product Grid Column -->
        <main class="lg:col-span-3">
          <!-- Loading Skeletons -->
          <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 gap-6">
            <ProductCardSkeleton v-for="n in 6" :key="n" />
          </div>

          <!-- Empty State -->
          <div v-else-if="products.length === 0" class="text-center py-16 bg-base-200/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 space-y-3">
            <Search class="w-10 h-10 text-base-content/30 mx-auto" />
            <h3 class="font-extrabold text-lg text-base-content">No greeting cards found</h3>
            <p class="text-xs text-base-content/60">Try adjusting your filters or search keywords.</p>
            <button @click="clearAllFilters" class="btn btn-primary btn-sm rounded-xl font-bold mt-2">
              Reset Filters
            </button>
          </div>

          <!-- Products Grid -->
          <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-6">
            <ProductCard v-for="card in products" :key="card.id" :product="card" />
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search } from 'lucide-vue-next'
import { getProducts, getCategories } from '../services/pocketbase'
import ProductCard from '../components/products/ProductCard.vue'
import ProductCardSkeleton from '../components/products/ProductCardSkeleton.vue'
import Breadcrumbs from '../components/ui/Breadcrumbs.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const products = ref([])
const categories = ref([])
const selectedCategory = ref(route.query.category || null)
const searchQuery = ref(route.query.search || '')
const minPrice = ref(route.query.minPrice || null)
const maxPrice = ref(route.query.maxPrice || null)
const selectedSort = ref('-created')

async function fetchData() {
  loading.value = true
  try {
    const res = await getProducts({
      categorySlug: selectedCategory.value,
      search: searchQuery.value,
      sort: selectedSort.value,
      perPage: 50,
    })

    // Filter by min/max in memory if specified
    let items = res.items
    if (minPrice.value) {
      items = items.filter((p) => p.price >= Number(minPrice.value))
    }
    if (maxPrice.value) {
      items = items.filter((p) => p.price <= Number(maxPrice.value))
    }

    products.value = items
  } catch (err) {
    console.error('Error loading shop products:', err)
  } finally {
    loading.value = false
  }
}

function setCategory(catSlug) {
  selectedCategory.value = catSlug
  router.push({
    path: '/shop',
    query: {
      ...route.query,
      category: catSlug || undefined,
    },
  })
  fetchData()
}

function clearAllFilters() {
  selectedCategory.value = null
  searchQuery.value = ''
  minPrice.value = null
  maxPrice.value = null
  router.push({ path: '/shop' })
  fetchData()
}

watch(
  () => route.query,
  (newQuery) => {
    selectedCategory.value = newQuery.category || null
    searchQuery.value = newQuery.search || ''
    fetchData()
  }
)

onMounted(async () => {
  try {
    categories.value = await getCategories()
  } catch (err) {
    console.error('Error fetching categories:', err)
  }
  await fetchData()
})
</script>

