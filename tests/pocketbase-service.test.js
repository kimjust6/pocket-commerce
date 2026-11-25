import { describe, it, expect, beforeEach, vi } from 'vitest'

const collections = {}
const mockPb = {
  authStore: { isValid: false, model: null },
  filter: vi.fn((expr, params = {}) => {
    let out = expr
    for (const [k, v] of Object.entries(params)) {
      out = out.replaceAll(`{:${k}}`, JSON.stringify(v))
    }
    return out
  }),
  files: {
    getUrl: vi.fn((record, filename) => `https://pb.test/api/files/${record.id}/${filename}`),
  },
  collection: vi.fn((name) => {
    if (!collections[name]) {
      collections[name] = {
        getFullList: vi.fn(),
        getList: vi.fn(),
        getFirstListItem: vi.fn(),
        getOne: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
      }
    }
    return collections[name]
  }),
}

vi.mock('pocketbase', () => ({
  default: vi.fn(function () {
    return mockPb
  }),
}))

const { getFileUrl } = await import('../src/services/pbClient.js')
const { getCategories, getProducts, getProduct } = await import('../src/services/catalogService.js')
const { createOrder, getUserOrders } = await import('../src/services/orderService.js')
const { getUserAddresses } = await import('../src/services/addressService.js')

describe('PocketBase Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPb.authStore.isValid = false
    mockPb.authStore.model = null
    for (const key of Object.keys(collections)) {
      for (const fn of Object.values(collections[key])) {
        fn.mockReset()
      }
    }
  })

  describe('getFileUrl', () => {
    it('returns empty string for missing record or filename', () => {
      expect(getFileUrl(null, 'a.png')).toBe('')
      expect(getFileUrl({ id: '1' }, '')).toBe('')
    })

    it('returns absolute and root-relative URLs as-is', () => {
      expect(getFileUrl({ id: '1' }, 'https://cdn.example.com/a.webp')).toBe('https://cdn.example.com/a.webp')
      expect(getFileUrl({ id: '1' }, '/card-birthday.webp')).toBe('/card-birthday.webp')
    })

    it('delegates to pb.files.getUrl for PocketBase filenames', () => {
      const url = getFileUrl({ id: 'rec1' }, 'photo.webp', { thumb: '100x100' })
      expect(url).toBe('https://pb.test/api/files/rec1/photo.webp')
      expect(mockPb.files.getUrl).toHaveBeenCalledWith({ id: 'rec1' }, 'photo.webp', { thumb: '100x100' })
    })
  })

  describe('getCategories', () => {
    it('returns sorted categories and propagates errors', async () => {
      mockPb.collection('categories').getFullList.mockResolvedValue([{ id: 'c1', name: 'Birthday' }])
      expect(await getCategories()).toEqual([{ id: 'c1', name: 'Birthday' }])

      mockPb.collection('categories').getFullList.mockRejectedValue(new Error('network'))
      await expect(getCategories()).rejects.toThrow('network')
    })
  })

  describe('getProducts', () => {
    it('uses pb.filter for category & search, attaches variants/images, and filters by min/max price', async () => {
      mockPb.collection('categories').getFirstListItem.mockResolvedValue({ id: 'cat_bday' })
      mockPb.collection('products').getList.mockResolvedValue({
        page: 1,
        perPage: 30,
        totalItems: 2,
        totalPages: 1,
        items: [
          {
            id: 'p1',
            name: 'Cheap Card',
            images: '["/img1.webp"]',
            expand: { category: { name: 'Birthday', slug: 'birthday' } },
          },
          {
            id: 'p2',
            name: 'Pack Card',
            images: [],
            expand: { category: { name: 'Birthday', slug: 'birthday' } },
          },
        ],
      })
      mockPb.collection('product_variants').getFullList.mockResolvedValue([
        { id: 'v1', product: 'p1', price: 4.5, compare_at_price: 6.0 },
        { id: 'v2', product: 'p2', price: 15.0, compare_at_price: 0 },
      ])

      const res = await getProducts({
        categorySlug: 'birthday',
        search: "it's",
        minPrice: 4,
        maxPrice: 10,
      })

      expect(mockPb.filter).toHaveBeenCalledWith('slug = {:slug}', { slug: 'birthday' })
      expect(mockPb.filter).toHaveBeenCalledWith('(name ~ {:q} || description ~ {:q})', { q: "it's" })
      expect(res.items).toHaveLength(1)
      expect(res.items[0].id).toBe('p1')
      expect(res.items[0].price).toBe(4.5)
      expect(res.items[0].compareAtPrice).toBe(6.0)
      expect(res.items[0].primaryImage).toBe('/img1.webp')
    })

    it('propagates errors from product list query', async () => {
      mockPb.collection('products').getList.mockRejectedValue(new Error('db fail'))
      await expect(getProducts({ perPage: 12 })).rejects.toThrow('db fail')
    })
  })

  describe('getProduct', () => {
    it('falls back to getOne when slug lookup throws and attaches variants and reviews', async () => {
      mockPb.collection('products').getFirstListItem.mockRejectedValue(new Error('not found'))
      mockPb.collection('products').getOne.mockResolvedValue({
        id: 'p99',
        name: 'Cat Card',
        images: '/cat.webp',
      })
      mockPb.collection('product_variants').getFullList.mockResolvedValue([
        { id: 'v1', price: 5.99, compare_at_price: 0 },
      ])
      mockPb.collection('reviews').getFullList.mockResolvedValue([{ id: 'r1', rating: 5 }])

      const product = await getProduct('p99')
      expect(product.id).toBe('p99')
      expect(product.price).toBe(5.99)
      expect(product.images).toEqual(['/cat.webp'])
      expect(product.reviews).toHaveLength(1)
    })

    it('returns null if product cannot be loaded', async () => {
      mockPb.collection('products').getFirstListItem.mockRejectedValue(new Error('404'))
      mockPb.collection('products').getOne.mockRejectedValue(new Error('404'))
      expect(await getProduct('missing')).toBeNull()
    })
  })

  describe('createOrder', () => {
    it('creates order and order_items, mapping default variantId to null', async () => {
      mockPb.authStore.model = { id: 'user_1' }
      mockPb.collection('orders').create.mockResolvedValue({ id: 'ord_1' })
      mockPb.collection('order_items').create.mockResolvedValue({ id: 'oi_1' })

      const order = await createOrder(
        { totalAmount: 9.99, shippingAddress: '123 St', paymentMethod: 'stripe', email: 'a@b.com' },
        [{ productId: 'p1', variantId: 'default', quantity: 2, price: 4.99 }]
      )

      expect(order.id).toBe('ord_1')
      expect(mockPb.collection('order_items').create).toHaveBeenCalledWith({
        order: 'ord_1',
        variant: null,
        product: 'p1',
        quantity: 2,
        price: 4.99,
      })
    })

    it('deletes order and rethrows if order_items creation fails', async () => {
      mockPb.collection('orders').create.mockResolvedValue({ id: 'ord_bad' })
      mockPb.collection('order_items').create.mockRejectedValue(new Error('invalid item'))
      mockPb.collection('orders').delete.mockResolvedValue(true)

      await expect(
        createOrder(
          { totalAmount: 5, shippingAddress: '123 St', email: 'a@b.com' },
          [{ productId: 'p1', variantId: 'v1', quantity: 1, price: 5 }]
        )
      ).rejects.toThrow('invalid item')

      expect(mockPb.collection('orders').delete).toHaveBeenCalledWith('ord_bad')
    })
  })

  describe('authenticated user queries', () => {
    it('returns [] when unauthenticated and fetches records when authenticated', async () => {
      expect(await getUserOrders()).toEqual([])
      expect(await getUserAddresses()).toEqual([])

      mockPb.authStore.isValid = true
      mockPb.authStore.model = { id: 'u1' }
      mockPb.collection('orders').getFullList.mockResolvedValue([{ id: 'o1' }])
      mockPb.collection('addresses').getFullList.mockResolvedValue([{ id: 'a1' }])

      expect(await getUserOrders()).toEqual([{ id: 'o1' }])
      expect(await getUserAddresses()).toEqual([{ id: 'a1' }])
    })
  })
})
