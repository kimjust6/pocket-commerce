import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useProductFilters() {
  const route = useRoute()
  const router = useRouter()

  const selectedCategory = ref(route.query.category || null)
  const searchQuery = ref(route.query.search || '')
  const minPrice = ref(route.query.minPrice || null)
  const maxPrice = ref(route.query.maxPrice || null)
  const selectedSort = ref(route.query.sort || '-created')

  function syncFromQuery(query = {}) {
    selectedCategory.value = query.category || null
    searchQuery.value = query.search || ''
    minPrice.value = query.minPrice || null
    maxPrice.value = query.maxPrice || null
    selectedSort.value = query.sort || '-created'
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
  }

  function clearAllFilters() {
    selectedCategory.value = null
    searchQuery.value = ''
    minPrice.value = null
    maxPrice.value = null
    selectedSort.value = '-created'
    router.push({ path: '/shop' })
  }

  function toQueryOptions() {
    return {
      categorySlug: selectedCategory.value,
      search: searchQuery.value,
      minPrice: minPrice.value,
      maxPrice: maxPrice.value,
      sort: selectedSort.value,
      perPage: 50,
    }
  }

  return {
    selectedCategory,
    searchQuery,
    minPrice,
    maxPrice,
    selectedSort,
    syncFromQuery,
    setCategory,
    clearAllFilters,
    toQueryOptions,
  }
}
