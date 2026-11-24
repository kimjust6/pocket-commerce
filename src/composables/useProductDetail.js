import { ref, computed } from 'vue'
import { getProduct } from '../services/catalogService'
import { updateSeoMeta, buildProductJsonLd } from '../utils/seo'

export function useProductDetail() {
  const loading = ref(true)
  const product = ref(null)
  const selectedImage = ref('')
  const selectedVariant = ref(null)

  const currentPrice = computed(() => {
    return selectedVariant.value?.price ?? product.value?.price ?? 4.99
  })

  const reviewCount = computed(() => product.value?.reviews?.length || 0)

  const averageRating = computed(() => {
    if (!reviewCount.value) return 0
    const total = product.value.reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0)
    return total / reviewCount.value
  })

  async function loadProduct(slug) {
    loading.value = true
    try {
      const res = await getProduct(slug)
      product.value = res
      if (res) {
        selectedImage.value = res.primaryImage
        if (res.variants?.length > 0) {
          selectedVariant.value = res.variants[0]
        }
        updateSeoMeta({
          title: res.name,
          description: res.description || `${res.name} — handcrafted greeting card printed on 100% recycled paper.`,
          image: res.primaryImage,
          type: 'product',
          canonicalPath: `/shop/card/${res.slug}`,
          jsonLd: buildProductJsonLd(res, typeof window !== 'undefined' ? window.location.origin : ''),
        })
      }
    } catch (err) {
      console.error('Error fetching product:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    product,
    selectedImage,
    selectedVariant,
    currentPrice,
    reviewCount,
    averageRating,
    loadProduct,
  }
}
