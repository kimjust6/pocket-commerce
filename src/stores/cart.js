import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const CART_STORAGE_KEY = 'pocket_commerce_cart'

export const useCartStore = defineStore('cart', () => {
  // Load initial items from localStorage
  const savedCart = typeof localStorage !== 'undefined' ? localStorage.getItem(CART_STORAGE_KEY) : null
  const items = ref(savedCart ? JSON.parse(savedCart) : [])
  const isDrawerOpen = ref(false)
  const coupon = ref(null)

  function saveCart() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items.value))
    }
  }

  const totalItems = computed(() => {
    return items.value.reduce((total, item) => total + (item.quantity || 1), 0)
  })

  const subtotal = computed(() => {
    return items.value.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0)
  })

  const discountAmount = computed(() => {
    if (!coupon.value) return 0
    return (subtotal.value * coupon.value.discount) / 100
  })

  const shippingAmount = computed(() => {
    if (subtotal.value === 0) return 0
    // Free shipping on orders over $35
    return subtotal.value >= 35 ? 0 : 4.99
  })

  const taxAmount = computed(() => {
    const taxableAmount = Math.max(0, subtotal.value - discountAmount.value)
    return taxableAmount * 0.08 // 8% sales tax
  })

  const total = computed(() => {
    if (subtotal.value === 0) return 0
    return Math.max(0, subtotal.value - discountAmount.value + shippingAmount.value + taxAmount.value)
  })

  function addToCart(product, variant = null, quantity = 1) {
    const variantId = variant?.id || 'default'
    const price = variant?.price || product.price || 4.99
    const format = variant?.attributes?.Format || 'Single Card'

    // Look for existing item
    const existingIndex = items.value.findIndex(
      (item) => item.productId === product.id && item.variantId === variantId
    )

    if (existingIndex > -1) {
      items.value[existingIndex].quantity += quantity
    } else {
      items.value.push({
        id: `${product.id}_${variantId}`,
        productId: product.id,
        variantId,
        name: product.name,
        slug: product.slug,
        price,
        image: product.primaryImage || product.images?.[0] || '/card-birthday.webp',
        format,
        quantity,
      })
    }

    saveCart()
    isDrawerOpen.value = true
  }

  function updateQuantity(itemId, quantity) {
    const idx = items.value.findIndex((item) => item.id === itemId)
    if (idx > -1) {
      if (quantity <= 0) {
        items.value.splice(idx, 1)
      } else {
        items.value[idx].quantity = quantity
      }
      saveCart()
    }
  }

  function removeFromCart(itemId) {
    items.value = items.value.filter((item) => item.id !== itemId)
    saveCart()
  }

  function clearCart() {
    items.value = []
    coupon.value = null
    saveCart()
  }

  function applyCoupon(code) {
    const cleanCode = (code || '').trim().toUpperCase()
    if (cleanCode === 'POCKET10') {
      coupon.value = { code: cleanCode, discount: 10 }
      return { success: true, message: '10% discount applied!' }
    } else if (cleanCode === 'FREESHIP') {
      coupon.value = { code: cleanCode, discount: 0, freeShipping: true }
      return { success: true, message: 'Free shipping promo activated!' }
    } else if (cleanCode === 'WELCOME20') {
      coupon.value = { code: cleanCode, discount: 20 }
      return { success: true, message: '20% Welcome discount applied!' }
    }
    return { success: false, message: 'Invalid promo code.' }
  }

  function removeCoupon() {
    coupon.value = null
  }

  return {
    items,
    isDrawerOpen,
    coupon,
    totalItems,
    subtotal,
    discountAmount,
    shippingAmount,
    taxAmount,
    total,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
  }
})
