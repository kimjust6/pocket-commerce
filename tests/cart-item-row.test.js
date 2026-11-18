// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CartItemRow from '../src/components/cart/CartItemRow.vue'

const sampleItem = {
  id: 'prd1_v1',
  productId: 'prd1',
  variantId: 'v1',
  name: 'Birthday Cat Card',
  slug: 'birthday-cat-card',
  format: 'Single Card',
  price: 4.99,
  quantity: 2,
  image: '/card-birthday.webp',
}

const RouterLinkStub = {
  template: '<a :href="to"><slot /></a>',
  props: ['to'],
}

describe('CartItemRow', () => {
  it('renders drawer mode and forwards updateQuantity and remove events', async () => {
    const wrapper = mount(CartItemRow, {
      props: { item: sampleItem, mode: 'drawer' },
      global: { stubs: { 'router-link': RouterLinkStub } },
    })

    expect(wrapper.text()).toContain('Birthday Cat Card')
    expect(wrapper.text()).toContain('$4.99')

    await wrapper.get('button[aria-label="Increase quantity"]').trigger('click')
    expect(wrapper.emitted('updateQuantity')).toEqual([['prd1_v1', 3]])

    const removeBtn = wrapper.findAll('button').find((b) => b.text() === 'Remove')
    await removeBtn.trigger('click')
    expect(wrapper.emitted('remove')).toEqual([['prd1_v1']])
  })

  it('renders review mode with line total and quantity badge', () => {
    const wrapper = mount(CartItemRow, {
      props: { item: sampleItem, mode: 'review' },
      global: { stubs: { 'router-link': RouterLinkStub } },
    })

    expect(wrapper.text()).toContain('Birthday Cat Card')
    expect(wrapper.text()).toContain('2')
    expect(wrapper.text()).toContain('$9.98')
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('renders default table mode with line total and remove button', async () => {
    const wrapper = mount(CartItemRow, {
      props: { item: sampleItem },
      global: { stubs: { 'router-link': RouterLinkStub } },
    })

    expect(wrapper.text()).toContain('$4.99 each')
    expect(wrapper.text()).toContain('$9.98')

    await wrapper.get('button[aria-label="Decrease quantity"]').trigger('click')
    expect(wrapper.emitted('updateQuantity')).toEqual([['prd1_v1', 1]])

    await wrapper.get('button[aria-label="Remove item"]').trigger('click')
    expect(wrapper.emitted('remove')).toEqual([['prd1_v1']])
  })
})
