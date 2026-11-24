import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { createStorageAdapter } from '../utils/storage'
import {
  validateCoupon,
  calculateSubtotal,
  calculateDiscount,
  calculateShipping,
  calculateTax,
  calculateTotal,
} from '../utils/pricing'

const CART_STORAGE_KEY = 'pocket_commerce_cart'

export const useCartStore = defineStore('cart', () => {
  const storage = createStorageAdapter()
  const saved = storage.getJson(CART_STORAGE_KEY, [])
  const items = ref(Array.isArray(saved) ? saved : [])
  const isDrawerOpen = ref(false)
  const coupon = ref(null)

  function saveCart() {
    storage.setJson(CART_STORAGE_KEY, items.value)
  }

  const totalItems = computed(() => {
    return items.value.reduce((total, item) => total + (item.quantity || 1), 0)
  })

  const subtotal = computed(() => calculateSubtotal(items.value))
  const discountAmount = computed(() => calculateDiscount(subtotal.value, coupon.value))
  const shippingAmount = computed(() => calculateShipping(subtotal.value, coupon.value))
  const taxAmount = computed(() => calculateTax(subtotal.value, discountAmount.value))
  const total = computed(() =>
    calculateTotal(subtotal.value, discountAmount.value, shippingAmount.value, taxAmount.value)
  )

  function addToCart(product, variant = null, quantity = 1) {
    const variantId = variant?.id || 'default'
    const price = variant?.price ?? product.price ?? 4.99
    const format = variant?.attributes?.Format || 'Single Card'

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
    const result = validateCoupon(code)
    if (result.success) {
      coupon.value = result.coupon
    }
    return { success: result.success, message: result.message }
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
