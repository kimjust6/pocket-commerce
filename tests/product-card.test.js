// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import ProductCard from '../src/components/products/ProductCard.vue'
import { useCartStore } from '../src/stores/cart.js'
import { useToastStore } from '../src/stores/toast.js'

describe('ProductCard', () => {
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

  const sampleProduct = {
    id: 'prd_1',
    name: 'Birthday Cat Card',
    slug: 'birthday-cat',
    description: 'Hand-illustrated cat card.',
    categoryName: 'Birthday',
    price: 4.99,
    compareAtPrice: 6.99,
    primaryImage: '/card-birthday.webp',
    variants: [{ id: 'var_1', price: 4.99, attributes: { Format: 'Single Card' } }],
  }

  it('renders product details, category badge, and SALE indicator', () => {
    const wrapper = mount(ProductCard, {
      props: { product: sampleProduct },
      global: { stubs: { RouterLink: RouterLinkStub } },
    })

    expect(wrapper.text()).toContain('Birthday Cat Card')
    expect(wrapper.text()).toContain('Birthday')
    expect(wrapper.text()).toContain('SALE')
    expect(wrapper.text()).toContain('$4.99')
    expect(wrapper.text()).toContain('$6.99')
  })

  it('adds default variant to cart and shows a toast on + Add click', async () => {
    const cartStore = useCartStore()
    const toastStore = useToastStore()

    const wrapper = mount(ProductCard, {
      props: { product: sampleProduct },
      global: { stubs: { RouterLink: RouterLinkStub } },
    })

    await wrapper.find('button.btn-primary').trigger('click')

    expect(cartStore.items).toHaveLength(1)
    expect(cartStore.items[0].variantId).toBe('var_1')
    expect(toastStore.toasts).toHaveLength(1)
    expect(toastStore.toasts[0].message).toContain('Birthday Cat Card')
  })
})
