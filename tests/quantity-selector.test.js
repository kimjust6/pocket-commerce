// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import QuantitySelector from '../src/components/ui/QuantitySelector.vue'

describe('QuantitySelector', () => {
  it('renders the quantity and emits update on increment and decrement', async () => {
    const wrapper = mount(QuantitySelector, {
      props: { quantity: 3 },
    })

    expect(wrapper.text()).toContain('3')

    await wrapper.get('button[aria-label="Decrease quantity"]').trigger('click')
    await wrapper.get('button[aria-label="Increase quantity"]').trigger('click')

    expect(wrapper.emitted('update')).toEqual([[2], [4]])
  })

  it('clamps decrement to min prop', async () => {
    const wrapper = mount(QuantitySelector, {
      props: { quantity: 1, min: 1 },
    })

    await wrapper.get('button[aria-label="Decrease quantity"]').trigger('click')
    expect(wrapper.emitted('update')).toEqual([[1]])
  })

  it('applies xs and sm size classes', () => {
    const xsWrapper = mount(QuantitySelector, {
      props: { quantity: 1, size: 'xs' },
    })
    expect(xsWrapper.get('div').classes()).toContain('rounded-lg')
    expect(xsWrapper.get('button[aria-label="Decrease quantity"]').classes()).toContain('btn-xs')

    const smWrapper = mount(QuantitySelector, {
      props: { quantity: 1, size: 'sm' },
    })
    expect(smWrapper.get('div').classes()).toContain('rounded-xl')
    expect(smWrapper.get('button[aria-label="Decrease quantity"]').classes()).toContain('btn-sm')
  })
})

