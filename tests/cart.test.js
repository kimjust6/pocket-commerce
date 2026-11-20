import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCartStore } from '../src/stores/cart.js'

describe('Cart Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    global.localStorage = {
      _data: {},
      getItem(key) { return this._data[key] || null },
      setItem(key, val) { this._data[key] = String(val) },
      removeItem(key) { delete this._data[key] },
      clear() { this._data = {} }
    }
  })

  it('initializes with empty items', () => {
    const cart = useCartStore()
    expect(cart.items).toEqual([])
    expect(cart.totalItems).toBe(0)
    expect(cart.subtotal).toBe(0)
    expect(cart.total).toBe(0)
  })

  it('adds an item to cart and calculates subtotal', () => {
    const cart = useCartStore()
    const product = {
      id: 'prd001',
      name: 'Funny Toast Card',
      slug: 'funny-toast-card',
      price: 4.99,
      primaryImage: '/card-food.webp',
    }

    cart.addToCart(product, null, 2)
    expect(cart.items.length).toBe(1)
    expect(cart.totalItems).toBe(2)
    expect(cart.subtotal).toBe(9.98)
  })

  it('applies promo code discounts correctly', () => {
    const cart = useCartStore()
    const product = {
      id: 'prd001',
      name: 'Card',
      price: 10.00,
    }
    cart.addToCart(product, null, 1)

    const res = cart.applyCoupon('WELCOME20')
    expect(res.success).toBe(true)
    expect(cart.discountAmount).toBe(2.00)
  })

  it('applies free shipping over $35', () => {
    const cart = useCartStore()
    const product = {
      id: 'prd001',
      name: 'Card Pack',
      price: 40.00,
    }
    cart.addToCart(product, null, 1)

    expect(cart.shippingAmount).toBe(0)
  })

  it('merges duplicate product and variant items and separates different variants', () => {
    const cart = useCartStore()
    const product = { id: 'prd001', name: 'Card', slug: 'card', price: 5.0 }

    cart.addToCart(product, { id: 'v1', price: 5.0, attributes: { Format: 'Single Card' } }, 1)
    cart.addToCart(product, { id: 'v1', price: 5.0, attributes: { Format: 'Single Card' } }, 2)
    cart.addToCart(product, { id: 'v2', price: 12.0, attributes: { Format: '5-Pack' } }, 1)

    expect(cart.items.length).toBe(2)
    expect(cart.items[0].quantity).toBe(3)
    expect(cart.items[1].quantity).toBe(1)
    expect(cart.totalItems).toBe(4)
    expect(cart.isDrawerOpen).toBe(true)
  })

  it('updates quantity, removes on zero or negative, and clears cart', () => {
    const cart = useCartStore()
    const product = { id: 'prd001', name: 'Card', slug: 'card', price: 10.0 }

    cart.addToCart(product, null, 2)
    const itemId = cart.items[0].id

    cart.updateQuantity(itemId, 5)
    expect(cart.items[0].quantity).toBe(5)

    cart.updateQuantity(itemId, 0)
    expect(cart.items).toEqual([])

    cart.addToCart(product, null, 1)
    cart.applyCoupon('POCKET10')
    cart.clearCart()
    expect(cart.items).toEqual([])
    expect(cart.coupon).toBeNull()
  })

  it('removes a single item with removeFromCart', () => {
    const cart = useCartStore()
    cart.addToCart({ id: 'p1', name: 'Card 1', price: 5.0 }, null, 1)
    cart.addToCart({ id: 'p2', name: 'Card 2', price: 6.0 }, null, 1)

    cart.removeFromCart('p1_default')
    expect(cart.items.map((i) => i.id)).toEqual(['p2_default'])
  })

  it('handles POCKET10, FREESHIP, normalization, invalid coupons, and removeCoupon', () => {
    const cart = useCartStore()
    cart.addToCart({ id: 'p1', name: 'Card', price: 20.0 }, null, 1)

    expect(cart.applyCoupon('  pocket10  ')).toEqual({
      success: true,
      message: '10% discount applied!',
    })
    expect(cart.discountAmount).toBe(2.0)

    expect(cart.applyCoupon('freeship')).toEqual({
      success: true,
      message: 'Free shipping promo activated!',
    })
    expect(cart.coupon.freeShipping).toBe(true)
    expect(cart.discountAmount).toBe(0)
    expect(cart.shippingAmount).toBe(0)

    expect(cart.applyCoupon('NOPE')).toEqual({
      success: false,
      message: 'Invalid promo code.',
    })

    cart.removeCoupon()
    expect(cart.coupon).toBeNull()
  })

  it('calculates shipping under $35, 8% tax, and total accurately', () => {
    const cart = useCartStore()
    cart.addToCart({ id: 'p1', name: 'Card', price: 20.0 }, null, 1)
    cart.applyCoupon('POCKET10') // $2 discount -> $18 taxable

    expect(cart.shippingAmount).toBe(4.99)
    expect(cart.taxAmount).toBeCloseTo(1.44, 5)
    expect(cart.total).toBeCloseTo(24.43, 5)
  })

  it('recovers gracefully from malformed localStorage cart data', () => {
    global.localStorage.setItem('pocket_commerce_cart', '{invalid-json')
    const cart = useCartStore()
    expect(cart.items).toEqual([])
  })
})
