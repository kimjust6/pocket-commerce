import PocketBase from 'pocketbase'

// Use environment variable, or fallback to relative/window origin in production or dev proxy
const PB_URL = import.meta.env.VITE_PB_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:8090')

export const pb = new PocketBase(PB_URL)

/**
 * Helper to build PocketBase file URLs
 */
export function getFileUrl(record, filename, queryParams = {}) {
  if (!record || !filename) return ''
  if (filename.startsWith('http://') || filename.startsWith('https://') || filename.startsWith('/')) {
    return filename
  }
  return pb.files.getUrl(record, filename, queryParams)
}

/**
 * Categories Service
 */
export async function getCategories() {
  try {
    return await pb.collection('categories').getFullList({
      sort: 'name',
    })
  } catch (err) {
    console.error('Error fetching categories:', err)
    return []
  }
}

/**
 * Products Service
 */
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
    // Look up category ID by slug first
    try {
      const cat = await pb.collection('categories').getFirstListItem(`slug = '${categorySlug}'`)
      if (cat) {
        filterParts.push(`category = '${cat.id}'`)
      }
    } catch {
      // ignore if category not found
    }
  }

  if (search) {
    filterParts.push(`(name ~ '${search}' || description ~ '${search}')`)
  }

  const filter = filterParts.join(' && ')

  try {
    const result = await pb.collection('products').getList(page, perPage, {
      filter,
      sort,
      expand: 'category',
    })

    // Fetch variants to attach pricing
    const productIds = result.items.map((p) => p.id)
    let variantsByProduct = {}
    if (productIds.length > 0) {
      try {
        const variantsFilter = productIds.map((id) => `product = '${id}'`).join(' || ')
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

    // Attach min price and variants to products
    const processedItems = result.items.map((p) => {
      const pVariants = variantsByProduct[p.id] || []
      let minPrice = null
      let compareAtPrice = null
      pVariants.forEach((v) => {
        if (minPrice === null || v.price < minPrice) {
          minPrice = v.price
          compareAtPrice = v.compare_at_price
        }
      })

      // Normalize images
      let images = []
      if (Array.isArray(p.images)) {
        images = p.images
      } else if (typeof p.images === 'string') {
        try {
          images = JSON.parse(p.images)
        } catch {
          images = [p.images]
        }
      }
      if (!images || images.length === 0) {
        images = ['/card-birthday.webp']
      }

      return {
        ...p,
        images,
        primaryImage: images[0] || '/card-birthday.webp',
        price: minPrice !== null ? minPrice : 4.99,
        compareAtPrice: compareAtPrice || 0,
        variants: pVariants,
        categoryName: p.expand?.category?.name || 'Greetings',
        categorySlug: p.expand?.category?.slug || 'birthday',
      }
    })

    return {
      ...result,
      items: processedItems,
    }
  } catch (err) {
    console.error('Error fetching products:', err)
    return { items: [], totalItems: 0, totalPages: 0, page: 1, perPage }
  }
}

/**
 * Get Product by slug or id
 */
export async function getProduct(slugOrId) {
  try {
    let product
    try {
      product = await pb.collection('products').getFirstListItem(`slug = '${slugOrId}'`, {
        expand: 'category',
      })
    } catch {
      product = await pb.collection('products').getOne(slugOrId, {
        expand: 'category',
      })
    }

    if (!product) return null

    // Get variants
    const variants = await pb.collection('product_variants').getFullList({
      filter: `product = '${product.id}'`,
    })

    // Get reviews
    let reviews = []
    try {
      reviews = await pb.collection('reviews').getFullList({
        filter: `product = '${product.id}'`,
        expand: 'user',
        sort: '-created',
      })
    } catch {}

    let images = []
    if (Array.isArray(product.images)) {
      images = product.images
    } else if (typeof product.images === 'string') {
      try {
        images = JSON.parse(product.images)
      } catch {
        images = [product.images]
      }
    }
    if (!images || images.length === 0) {
      images = ['/card-birthday.webp']
    }

    let minPrice = null
    let compareAtPrice = null
    variants.forEach((v) => {
      if (minPrice === null || v.price < minPrice) {
        minPrice = v.price
        compareAtPrice = v.compare_at_price
      }
    })

    return {
      ...product,
      images,
      primaryImage: images[0] || '/card-birthday.webp',
      price: minPrice !== null ? minPrice : 4.99,
      compareAtPrice: compareAtPrice || 0,
      variants,
      reviews,
      categoryName: product.expand?.category?.name || 'Greetings',
      categorySlug: product.expand?.category?.slug || 'birthday',
    }
  } catch (err) {
    console.error('Error getting product details:', err)
    return null
  }
}

/**
 * Reviews Service
 */
export async function createReview(reviewData) {
  return await pb.collection('reviews').create(reviewData)
}

/**
 * Orders Service
 */
export async function createOrder(orderPayload, items) {
  const currentUserId = pb.authStore.model?.id || null
  
  // 1. Create order record
  const orderRecord = await pb.collection('orders').create({
    user: currentUserId,
    total_amount: orderPayload.totalAmount,
    status: 'pending',
    shipping_address: orderPayload.shippingAddress,
    payment_method: orderPayload.paymentMethod || 'card',
    contact_email: orderPayload.email,
  })

  // 2. Create order items
  for (const item of items) {
    try {
      await pb.collection('order_items').create({
        order: orderRecord.id,
        variant: item.variantId || null,
        product: item.productId || null,
        quantity: item.quantity,
        price: item.price,
      })
    } catch (e) {
      console.warn('Could not record order item:', e)
    }
  }

  return orderRecord
}

export async function getUserOrders() {
  if (!pb.authStore.isValid || !pb.authStore.model) return []
  try {
    return await pb.collection('orders').getFullList({
      filter: `user = '${pb.authStore.model.id}'`,
      sort: '-created',
    })
  } catch (err) {
    console.error('Error fetching user orders:', err)
    return []
  }
}

/**
 * Addresses Service
 */
export async function getUserAddresses() {
  if (!pb.authStore.isValid || !pb.authStore.model) return []
  try {
    return await pb.collection('addresses').getFullList({
      filter: `user = '${pb.authStore.model.id}'`,
      sort: '-created',
    })
  } catch (err) {
    console.error('Error fetching addresses:', err)
    return []
  }
}

export async function createAddress(addressData) {
  return await pb.collection('addresses').create({
    ...addressData,
    user: pb.authStore.model?.id,
  })
}

export async function updateAddress(id, addressData) {
  return await pb.collection('addresses').update(id, addressData)
}

export async function deleteAddress(id) {
  return await pb.collection('addresses').delete(id)
}

