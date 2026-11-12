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
})
