import { describe, it, expect } from 'vitest'
import {
  validateCoupon,
  calculateSubtotal,
  calculateDiscount,
  calculateShipping,
  calculateTax,
  calculateTotal,
} from '../src/utils/pricing'

describe('pricing utilities', () => {
  it('validates known coupons case-insensitively and rejects unknown codes', () => {
    expect(validateCoupon(' pocket10 ')).toEqual({
      success: true,
      coupon: { code: 'POCKET10', discount: 10, freeShipping: false },
      message: '10% discount applied!',
    })
    expect(validateCoupon('freeship')).toEqual({
      success: true,
      coupon: { code: 'FREESHIP', discount: 0, freeShipping: true },
      message: 'Free shipping promo activated!',
    })
    expect(validateCoupon('INVALID')).toEqual({
      success: false,
      coupon: null,
      message: 'Invalid promo code.',
    })
  })

  it('computes subtotal, discount, shipping, tax, and total', () => {
    const items = [
      { price: 10, quantity: 2 },
      { price: 5, quantity: 1 },
    ]
    const subtotal = calculateSubtotal(items)
    expect(subtotal).toBe(25)

    const discount = calculateDiscount(subtotal, { discount: 20 })
    expect(discount).toBe(5)

    const shipping = calculateShipping(subtotal, null)
    expect(shipping).toBe(4.99)

    const freeShipping = calculateShipping(35, null)
    expect(freeShipping).toBe(0)

    const tax = calculateTax(subtotal, discount)
    expect(tax).toBeCloseTo(1.6, 5)

    const total = calculateTotal(subtotal, discount, shipping, tax)
    expect(total).toBeCloseTo(26.59, 5)
  })
})
