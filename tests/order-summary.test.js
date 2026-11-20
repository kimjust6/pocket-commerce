// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import OrderSummary from '../src/components/cart/OrderSummary.vue'
import { useCartStore } from '../src/stores/cart.js'

describe('OrderSummary', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    global.localStorage = {
      _data: {},
      getItem(key) { return this._data[key] || null },
      setItem(key, val) { this._data[key] = String(val) },
      removeItem(key) { delete this._data[key] },
      clear() { this._data = {} },
    }
  })

  it('renders subtotal, shipping, tax, and total for items under $35', () => {
    const cart = useCartStore()
    cart.addToCart({ id: 'p1', name: 'Card', price: 10.0 }, null, 2)

    const wrapper = mount(OrderSummary)
    expect(wrapper.text()).toContain('Subtotal (2 items)')
    expect(wrapper.text()).toContain('$20.00')
    expect(wrapper.text()).toContain('$4.99')
    expect(wrapper.text()).toContain('$1.60')
    expect(wrapper.text()).toContain('$26.59')
  })

  it('applies valid and invalid promo codes including FREESHIP', async () => {
    const cart = useCartStore()
    cart.addToCart({ id: 'p1', name: 'Card', price: 20.0 }, null, 1)

    const wrapper = mount(OrderSummary)
    const input = wrapper.find('input[type="text"]')
    const applyBtn = wrapper.find('button')

    await input.setValue('BADCODE')
    await applyBtn.trigger('click')
    expect(wrapper.text()).toContain('Invalid promo code.')

    await input.setValue('FREESHIP')
    await applyBtn.trigger('click')
    expect(wrapper.text()).toContain('Free shipping promo activated!')
    expect(wrapper.text()).toContain('FREE')
  })

  it('hides coupon input when showCoupon is false', () => {
    const wrapper = mount(OrderSummary, {
      props: { showCoupon: false, title: 'Payment Summary' },
    })
    expect(wrapper.text()).toContain('Payment Summary')
    expect(wrapper.find('input[type="text"]').exists()).toBe(false)
  })
})
