// @vitest-environment jsdom
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
        update: vi.fn(),
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

const { getUserOrders, getUserAddresses, getProducts, getProduct } = await import(
  '../src/services/pocketbase.js'
)
const { router } = await import('../src/router/index.js')

describe('Security: Client Auth Guards & Parameterized Queries', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    mockPb.authStore.isValid = false
    mockPb.authStore.model = null
    window.scrollTo = vi.fn()
    for (const key of Object.keys(collections)) {
      for (const fn of Object.values(collections[key])) {
        fn.mockReset()
      }
    }
    await router.push('/')
    await router.isReady()
  })

  it('blocks unauthenticated users from /account and /profile routes', async () => {
    await router.push('/account')
    expect(router.currentRoute.value.name).toBe('login')
    expect(router.currentRoute.value.query.redirect).toBe('/account')

    await router.push('/profile')
    expect(router.currentRoute.value.name).toBe('login')
    expect(router.currentRoute.value.query.redirect).toBe('/profile')
  })

  it('prevents unauthenticated calls to getUserOrders and getUserAddresses from querying PocketBase', async () => {
    expect(await getUserOrders()).toEqual([])
    expect(await getUserAddresses()).toEqual([])
    expect(mockPb.collection).not.toHaveBeenCalled()
  })

  it('uses pb.filter parameterized bindings for user-supplied search and categorySlug in getProducts', async () => {
    mockPb.collection('categories').getFirstListItem.mockResolvedValue({ id: 'cat_1' })
    mockPb.collection('products').getList.mockResolvedValue({
      page: 1,
      perPage: 30,
      totalItems: 0,
      totalPages: 0,
      items: [],
    })

    const injectedCategory = "' || 1=1 || '"
    const injectedSearch = "card' || status = 'draft"

    await getProducts({ categorySlug: injectedCategory, search: injectedSearch })

    expect(mockPb.filter).toHaveBeenCalledWith('slug = {:slug}', { slug: injectedCategory })
    expect(mockPb.filter).toHaveBeenCalledWith('(name ~ {:q} || description ~ {:q})', {
      q: injectedSearch,
    })
  })

  it('uses pb.filter parameterized binding for slugOrId in getProduct', async () => {
    mockPb.collection('products').getFirstListItem.mockResolvedValue({
      id: 'p1',
      name: 'Card',
      images: '["/a.webp"]',
    })
    mockPb.collection('product_variants').getFullList.mockResolvedValue([])
    mockPb.collection('reviews').getFullList.mockResolvedValue([])

    const injectedSlug = "birthday' || status = 'draft"
    await getProduct(injectedSlug)

    expect(mockPb.filter).toHaveBeenCalledWith('slug = {:slug}', { slug: injectedSlug })
  })
})

