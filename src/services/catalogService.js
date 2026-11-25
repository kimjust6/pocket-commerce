import { pb } from './pbClient'

const DEFAULT_PRODUCT_IMAGE = '/card-birthday.webp'
const DEFAULT_PRODUCT_PRICE = 4.99

/**
 * Normalize product images from array, JSON string, or single string.
 */
export function normalizeProductImages(rawImages) {
  let images = []
  if (Array.isArray(rawImages)) {
    images = rawImages
  } else if (typeof rawImages === 'string' && rawImages) {
    try {
      const parsed = JSON.parse(rawImages)
      images = Array.isArray(parsed) ? parsed : [rawImages]
    } catch {
      images = [rawImages]
    }
  }
  return images.length > 0 ? images : [DEFAULT_PRODUCT_IMAGE]
}

/**
 * Compute minimum price and its compareAtPrice across product variants.
 */
export function extractVariantPricing(variants = []) {
  let minPrice = null
  let compareAtPrice = null
  for (const v of variants) {
    if (minPrice === null || v.price < minPrice) {
      minPrice = v.price
      compareAtPrice = v.compare_at_price
    }
  }
  return {
    price: minPrice !== null ? minPrice : DEFAULT_PRODUCT_PRICE,
    compareAtPrice: compareAtPrice || 0,
  }
}

/**
 * Normalize a raw PocketBase product record with its variants and optional reviews.
 */
export function normalizeProduct(product, variants = [], reviews = undefined) {
  const images = normalizeProductImages(product.images)
  const { price, compareAtPrice } = extractVariantPricing(variants)

  const normalized = {
    ...product,
    images,
    primaryImage: images[0] || DEFAULT_PRODUCT_IMAGE,
    price,
    compareAtPrice,
    variants,
    categoryName: product.expand?.category?.name || 'Greetings',
    categorySlug: product.expand?.category?.slug || 'birthday',
  }

  if (reviews !== undefined) {
    normalized.reviews = reviews
  }

  return normalized
}

export async function getCategories() {
  return await pb.collection('categories').getFullList({
    sort: 'name',
  })
}

export async function getProducts(options = {}) {
  const {
    categorySlug = null,
    search = '',
    minPrice = null,
    maxPrice = null,
    sort = '-created',
    page = 1,
    perPage = 30,
  } = options

  const filterParts = ["status = 'active'"]

  if (categorySlug) {
    try {
      const cat = await pb.collection('categories').getFirstListItem(pb.filter('slug = {:slug}', { slug: categorySlug }))
      if (cat) {
        filterParts.push(pb.filter('category = {:catId}', { catId: cat.id }))
      }
    } catch {
      // ignore if category not found
    }
  }

  if (search) {
    filterParts.push(pb.filter('(name ~ {:q} || description ~ {:q})', { q: search }))
  }

  const filter = filterParts.join(' && ')

  const result = await pb.collection('products').getList(page, perPage, {
    filter,
    sort,
    expand: 'category',
  })

  const productIds = result.items.map((p) => p.id)
  const variantsByProduct = {}
  if (productIds.length > 0) {
    try {
      const variantsFilter = productIds
        .map((id, i) => pb.filter(`product = {:p${i}}`, { [`p${i}`]: id }))
        .join(' || ')
      const variants = await pb.collection('product_variants').getFullList({
        filter: variantsFilter,
      })
      variants.forEach((v) => {
        if (!variantsByProduct[v.product]) {
          variantsByProduct[v.product] = []
        }
        variantsByProduct[v.product].push(v)
      })
    } catch (vErr) {
      console.warn('Variants fetch warning:', vErr)
    }
  }

  const processedItems = result.items.map((p) =>
    normalizeProduct(p, variantsByProduct[p.id] || [])
  )

  const filteredItems = processedItems.filter((p) => {
    if (minPrice !== null && minPrice !== '' && p.price < Number(minPrice)) return false
    if (maxPrice !== null && maxPrice !== '' && p.price > Number(maxPrice)) return false
    return true
  })

  return {
    ...result,
    items: filteredItems,
  }
}

export async function getProduct(slugOrId) {
  try {
    let product
    try {
      product = await pb.collection('products').getFirstListItem(pb.filter('slug = {:slug}', { slug: slugOrId }), {
        expand: 'category',
      })
    } catch {
      product = await pb.collection('products').getOne(slugOrId, {
        expand: 'category',
      })
    }

    if (!product) return null

    const variants = await pb.collection('product_variants').getFullList({
      filter: pb.filter('product = {:productId}', { productId: product.id }),
    })

    let reviews = []
    try {
      reviews = await pb.collection('reviews').getFullList({
        filter: pb.filter('product = {:productId}', { productId: product.id }),
        expand: 'user',
        sort: '-created',
      })
    } catch {}

    return normalizeProduct(product, variants, reviews)
  } catch (err) {
    console.error('Error getting product details:', err)
    return null
  }
}

export async function createReview(reviewData) {
  return await pb.collection('reviews').create(reviewData)
}
