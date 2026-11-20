// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import RatingStars from '../src/components/ui/RatingStars.vue'
import Breadcrumbs from '../src/components/ui/Breadcrumbs.vue'

describe('RatingStars', () => {
  it('renders active stars according to value and optionally shows score', () => {
    const wrapper = mount(RatingStars, {
      props: { value: 3.6, showScore: true, size: 'lg' },
    })
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(5)
    // 3.6 rounds to 4 active stars
    expect(buttons[3].classes()).toContain('text-amber-500')
    expect(buttons[4].classes()).not.toContain('text-amber-500')
    expect(buttons[0].classes()).toContain('text-2xl')
    expect(wrapper.text()).toContain('3.6')
  })

  it('emits update:modelValue when interactive and clicked', async () => {
    const wrapper = mount(RatingStars, {
      props: { modelValue: 2, interactive: true },
    })
    await wrapper.findAll('button')[4].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[5]])
  })
})

describe('Breadcrumbs', () => {
  it('renders links for intermediate items and plain text for the last item', () => {
    const wrapper = mount(Breadcrumbs, {
      props: {
        items: [
          { label: 'Home', to: '/' },
          { label: 'Shop', to: '/shop' },
          { label: 'Birthday Cat' },
        ],
      },
      global: { stubs: { RouterLink: RouterLinkStub } },
    })

    const links = wrapper.findAllComponents(RouterLinkStub)
    expect(links).toHaveLength(2)
    expect(links[0].props('to')).toBe('/')
    expect(links[1].props('to')).toBe('/shop')
    expect(wrapper.find('span').text()).toBe('Birthday Cat')
  })
})

