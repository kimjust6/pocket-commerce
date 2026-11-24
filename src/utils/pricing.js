export const SHIPPING_CONFIG = {
  freeThreshold: 35,
  standardRate: 4.99,
  taxRate: 0.08,
}

export const COUPONS = {
  POCKET10: {
    code: 'POCKET10',
    type: 'percent',
    discount: 10,
    freeShipping: false,
    message: '10% discount applied!',
  },
  FREESHIP: {
    code: 'FREESHIP',
    type: 'free_shipping',
    discount: 0,
    freeShipping: true,
    message: 'Free shipping promo activated!',
  },
  WELCOME20: {
    code: 'WELCOME20',
    type: 'percent',
    discount: 20,
    freeShipping: false,
    message: '20% Welcome discount applied!',
  },
}

export function validateCoupon(code) {
  const cleanCode = (code || '').trim().toUpperCase()
  const coupon = COUPONS[cleanCode]
  if (!coupon) {
    return { success: false, coupon: null, message: 'Invalid promo code.' }
  }
  return {
    success: true,
    coupon: {
      code: coupon.code,
      discount: coupon.discount,
      freeShipping: coupon.freeShipping,
    },
    message: coupon.message,
  }
}

export function calculateSubtotal(items) {
  return (items || []).reduce((sum, item) => sum + item.price * (item.quantity || 1), 0)
}

export function calculateDiscount(subtotal, coupon) {
  if (!coupon || !coupon.discount) return 0
  return (subtotal * coupon.discount) / 100
}

export function calculateShipping(subtotal, coupon) {
  if (subtotal === 0) return 0
  if (coupon?.freeShipping) return 0
  return subtotal >= SHIPPING_CONFIG.freeThreshold ? 0 : SHIPPING_CONFIG.standardRate
}

export function calculateTax(subtotal, discountAmount) {
  const taxableAmount = Math.max(0, subtotal - discountAmount)
  return taxableAmount * SHIPPING_CONFIG.taxRate
}

export function calculateTotal(subtotal, discountAmount, shippingAmount, taxAmount) {
  if (subtotal === 0) return 0
  return Math.max(0, subtotal - discountAmount + shippingAmount + taxAmount)
}
