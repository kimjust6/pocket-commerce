import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createRequire } from 'node:module'
import { createHmac, timingSafeEqual } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const require = createRequire(import.meta.url)

function makeRecord(id, initial = {}) {
  const data = { id, ...initial }
  return {
    id,
    get: (k) => data[k],
    getString: (k) => (data[k] == null ? '' : String(data[k])),
    set: (k, v) => {
      data[k] = v
    },
    _data: data,
  }
}

function makeAuth(id, role = '') {
  return makeRecord(id, { role })
}

function loadStripeRoutes({ env = {}, records = {}, httpResponse = null } = {}) {
  const routes = {}
  const savedRecords = []

  global.routerAdd = (method, routePath, handler) => {
    routes[`${method.toUpperCase()} ${routePath}`] = handler
  }

  global.__hooks = path.resolve(process.cwd(), 'pb_hooks')
  global.require = require

  global.$os = {
    getenv: vi.fn((k) => env[k] || ''),
  }

  global.toString = (v) => (Buffer.isBuffer(v) ? v.toString('utf8') : String(v ?? ''))

  global.$security = {
    hs256: vi.fn((payload, secret) =>
      createHmac('sha256', secret).update(String(payload)).digest('hex')
    ),
    equal: vi.fn((a, b) => {
      const bufA = Buffer.from(String(a))
      const bufB = Buffer.from(String(b))
      if (bufA.length !== bufB.length) return false
      return timingSafeEqual(bufA, bufB)
    }),
  }

  global.$http = {
    send: vi.fn(() =>
      httpResponse || {
        statusCode: 200,
        json: { id: 'cs_test_123', url: 'https://checkout.stripe.com/pay/cs_test_123' },
      }
    ),
  }

  global.$app = {
    findRecordById: vi.fn((collection, id) => {
      const rec = records[collection]?.[id]
      if (!rec) throw new Error(`Not found: ${collection}/${id}`)
      return rec
    }),
    findRecordsByFilter: vi.fn((collection, _filter, _sort, _limit, _offset, params = {}) => {
      const all = Object.values(records[collection] || {})
      if (collection === 'order_items' && params.orderId) {
        return all.filter((r) => r.getString('order') === params.orderId)
      }
      return all
    }),
    save: vi.fn((rec) => {
      savedRecords.push(rec)
    }),
  }

  const hookPath = path.resolve(process.cwd(), 'pb_hooks/stripe.pb.js')
  const code = fs.readFileSync(hookPath, 'utf8')
  const fn = new Function(code)
  fn()

  return { routes, savedRecords }
}

function makeEvent({ auth = null, body = {}, headers = {}, query = {}, rawBody = '' } = {}) {
  const response = { status: null, payload: null }
  const lowerHeaders = {}
  for (const [k, v] of Object.entries(headers)) {
    lowerHeaders[k.toLowerCase()] = v
  }

  return {
    auth,
    requestInfo: () => ({
      body,
      headers,
    }),
    request: {
      body: rawBody,
      header: {
        get: (name) => lowerHeaders[name.toLowerCase()] || '',
      },
      url: {
        query: () => ({
          get: (name) => query[name] || '',
        }),
      },
    },
    json: (status, payload) => {
      response.status = status
      response.payload = payload
      return response
    },
  }
}

describe('Security: pb_hooks/stripe.pb.js endpoints', () => {
  const WEBHOOK_SECRET = 'whsec_test_secret_123'
  const STRIPE_KEY = 'sk_test_123'

  let orderRecord
  let productRecord
  let variantRecord
  let orderItemRecord

  beforeEach(() => {
    vi.clearAllMocks()
    orderRecord = makeRecord('ord_1', {
      user: 'user_owner',
      status: 'pending',
      total_amount: 10.0,
    })
    productRecord = makeRecord('prod_1', { name: 'Birthday Cat Card' })
    variantRecord = makeRecord('var_1', { price: 10.0, attributes: { Format: 'Single' } })
    orderItemRecord = makeRecord('oi_1', {
      order: 'ord_1',
      product: 'prod_1',
      variant: 'var_1',
      quantity: 1,
      price: 10.0,
    })
  })

  describe('POST /api/stripe/create-checkout-session', () => {
    it('rejects unauthenticated/random users with 401 and does not modify order or call Stripe', () => {
      const { routes, savedRecords } = loadStripeRoutes({
        env: { STRIPE_SECRET_KEY: STRIPE_KEY },
        records: {
          orders: { ord_1: orderRecord },
          order_items: { oi_1: orderItemRecord },
          products: { prod_1: productRecord },
          product_variants: { var_1: variantRecord },
        },
      })

      const res = routes['POST /api/stripe/create-checkout-session'](
        makeEvent({ auth: null, body: { orderId: 'ord_1', email: 'anon@evil.test' } })
      )

      expect(res.status).toBe(401)
      expect(savedRecords).toHaveLength(0)
      expect(global.$http.send).not.toHaveBeenCalled()
    })

    it('rejects another authenticated user (IDOR) with 403 and does not modify order total', () => {
      const { routes, savedRecords } = loadStripeRoutes({
        env: { STRIPE_SECRET_KEY: STRIPE_KEY },
        records: {
          orders: { ord_1: orderRecord },
          order_items: { oi_1: orderItemRecord },
          products: { prod_1: productRecord },
          product_variants: { var_1: variantRecord },
        },
      })

      const res = routes['POST /api/stripe/create-checkout-session'](
        makeEvent({
          auth: makeAuth('user_attacker', 'customer'),
          body: { orderId: 'ord_1', couponCode: 'WELCOME20' },
        })
      )

      expect(res.status).toBe(403)
      expect(orderRecord.get('total_amount')).toBe(10.0)
      expect(savedRecords).toHaveLength(0)
      expect(global.$http.send).not.toHaveBeenCalled()
    })

    it('allows the order owner and computes authoritative total server-side from variant price', () => {
      // Even if orderItem had a tampered client price (0.01), variant price (10.0) is authoritative
      orderItemRecord.set('price', 0.01)

      const { routes, savedRecords } = loadStripeRoutes({
        env: { STRIPE_SECRET_KEY: STRIPE_KEY, APP_URL: 'https://shop.example.com' },
        records: {
          orders: { ord_1: orderRecord },
          order_items: { oi_1: orderItemRecord },
          products: { prod_1: productRecord },
          product_variants: { var_1: variantRecord },
        },
      })

      const res = routes['POST /api/stripe/create-checkout-session'](
        makeEvent({
          auth: makeAuth('user_owner'),
          body: { orderId: 'ord_1', email: 'owner@example.com' },
        })
      )

      expect(res.status).toBe(200)
      expect(res.payload.sessionId).toBe('cs_test_123')
      expect(savedRecords).toHaveLength(1)
      // 10.00 subtotal + 4.99 shipping + 0.80 tax = 15.79
      expect(orderRecord.get('total_amount')).toBe(15.79)
    })

    it('allows admin users to create a checkout session for an order', () => {
      const { routes } = loadStripeRoutes({
        env: { STRIPE_SECRET_KEY: STRIPE_KEY },
        records: {
          orders: { ord_1: orderRecord },
          order_items: { oi_1: orderItemRecord },
          products: { prod_1: productRecord },
          product_variants: { var_1: variantRecord },
        },
      })

      const res = routes['POST /api/stripe/create-checkout-session'](
        makeEvent({
          auth: makeAuth('admin_1', 'admin'),
          body: { orderId: 'ord_1' },
        })
      )

      expect(res.status).toBe(200)
    })
  })

  describe('GET /api/stripe/verify-session', () => {
    it('rejects unauthenticated/random users with 401 without querying Stripe or updating order', () => {
      const { routes, savedRecords } = loadStripeRoutes({
        env: { STRIPE_SECRET_KEY: STRIPE_KEY },
        records: { orders: { ord_1: orderRecord } },
      })

      const res = routes['GET /api/stripe/verify-session'](
        makeEvent({ auth: null, query: { session_id: 'cs_test_123' } })
      )

      expect(res.status).toBe(401)
      expect(global.$http.send).not.toHaveBeenCalled()
      expect(savedRecords).toHaveLength(0)
      expect(orderRecord.getString('status')).toBe('pending')
    })

    it('rejects another authenticated user (IDOR) with 403 and does not mark order paid', () => {
      const { routes, savedRecords } = loadStripeRoutes({
        env: { STRIPE_SECRET_KEY: STRIPE_KEY },
        records: { orders: { ord_1: orderRecord } },
        httpResponse: {
          statusCode: 200,
          json: {
            client_reference_id: 'ord_1',
            payment_status: 'paid',
            amount_total: 1000,
          },
        },
      })

      const res = routes['GET /api/stripe/verify-session'](
        makeEvent({
          auth: makeAuth('user_attacker', 'customer'),
          query: { session_id: 'cs_test_123' },
        })
      )

      expect(res.status).toBe(403)
      expect(savedRecords).toHaveLength(0)
      expect(orderRecord.getString('status')).toBe('pending')
    })

    it('does not mark order paid when Stripe amount_total is underpaid', () => {
      const { routes, savedRecords } = loadStripeRoutes({
        env: { STRIPE_SECRET_KEY: STRIPE_KEY },
        records: { orders: { ord_1: orderRecord } },
        httpResponse: {
          statusCode: 200,
          json: {
            client_reference_id: 'ord_1',
            payment_status: 'paid',
            amount_total: 100, // $1.00 vs $10.00 expected
          },
        },
      })

      const res = routes['GET /api/stripe/verify-session'](
        makeEvent({
          auth: makeAuth('user_owner'),
          query: { session_id: 'cs_test_123' },
        })
      )

      expect(res.status).toBe(200)
      expect(savedRecords).toHaveLength(0)
      expect(orderRecord.getString('status')).toBe('pending')
    })

    it('marks order paid for the owner when Stripe confirms paid and full amount', () => {
      const { routes, savedRecords } = loadStripeRoutes({
        env: { STRIPE_SECRET_KEY: STRIPE_KEY },
        records: { orders: { ord_1: orderRecord } },
        httpResponse: {
          statusCode: 200,
          json: {
            client_reference_id: 'ord_1',
            payment_status: 'paid',
            amount_total: 1000,
          },
        },
      })

      const res = routes['GET /api/stripe/verify-session'](
        makeEvent({
          auth: makeAuth('user_owner'),
          query: { session_id: 'cs_test_123' },
        })
      )

      expect(res.status).toBe(200)
      expect(res.payload.paid).toBe(true)
      expect(savedRecords).toHaveLength(1)
      expect(orderRecord.getString('status')).toBe('paid')
    })
  })

  describe('POST /api/stripe/webhook', () => {
    function signPayload(rawBody, tsSec = Math.floor(Date.now() / 1000), secret = WEBHOOK_SECRET) {
      const sig = createHmac('sha256', secret).update(`${tsSec}.${rawBody}`).digest('hex')
      return `t=${tsSec},v1=${sig}`
    }

    it('rejects requests without Stripe-Signature header', () => {
      const { routes, savedRecords } = loadStripeRoutes({
        env: { STRIPE_WEBHOOK_SECRET: WEBHOOK_SECRET },
        records: { orders: { ord_1: orderRecord } },
      })

      const rawBody = JSON.stringify({
        type: 'checkout.session.completed',
        data: { object: { client_reference_id: 'ord_1', payment_status: 'paid', amount_total: 1000 } },
      })

      const res = routes['POST /api/stripe/webhook'](makeEvent({ rawBody, headers: {} }))
      expect(res.status).toBe(400)
      expect(savedRecords).toHaveLength(0)
      expect(orderRecord.getString('status')).toBe('pending')
    })

    it('rejects requests with forged/invalid Stripe-Signature', () => {
      const { routes, savedRecords } = loadStripeRoutes({
        env: { STRIPE_WEBHOOK_SECRET: WEBHOOK_SECRET },
        records: { orders: { ord_1: orderRecord } },
      })

      const rawBody = JSON.stringify({
        type: 'checkout.session.completed',
        data: { object: { client_reference_id: 'ord_1', payment_status: 'paid', amount_total: 1000 } },
      })
      const forgedSig = signPayload(rawBody, Math.floor(Date.now() / 1000), 'wrong_secret')

      const res = routes['POST /api/stripe/webhook'](
        makeEvent({ rawBody, headers: { 'Stripe-Signature': forgedSig } })
      )

      expect(res.status).toBe(400)
      expect(savedRecords).toHaveLength(0)
      expect(orderRecord.getString('status')).toBe('pending')
    })

    it('rejects expired webhook timestamps (> 300s old) to prevent replay attacks', () => {
      const { routes, savedRecords } = loadStripeRoutes({
        env: { STRIPE_WEBHOOK_SECRET: WEBHOOK_SECRET },
        records: { orders: { ord_1: orderRecord } },
      })

      const rawBody = JSON.stringify({
        type: 'checkout.session.completed',
        data: { object: { client_reference_id: 'ord_1', payment_status: 'paid', amount_total: 1000 } },
      })
      const expiredTs = Math.floor(Date.now() / 1000) - 600
      const expiredSig = signPayload(rawBody, expiredTs)

      const res = routes['POST /api/stripe/webhook'](
        makeEvent({ rawBody, headers: { 'Stripe-Signature': expiredSig } })
      )

      expect(res.status).toBe(400)
      expect(savedRecords).toHaveLength(0)
      expect(orderRecord.getString('status')).toBe('pending')
    })

    it('does not mark order paid on valid webhook if amount_total is underpaid', () => {
      const { routes, savedRecords } = loadStripeRoutes({
        env: { STRIPE_WEBHOOK_SECRET: WEBHOOK_SECRET },
        records: { orders: { ord_1: orderRecord } },
      })

      const rawBody = JSON.stringify({
        type: 'checkout.session.completed',
        data: { object: { client_reference_id: 'ord_1', payment_status: 'paid', amount_total: 500 } },
      })
      const validSig = signPayload(rawBody)

      const res = routes['POST /api/stripe/webhook'](
        makeEvent({ rawBody, headers: { 'Stripe-Signature': validSig } })
      )

      expect(res.status).toBe(200)
      expect(savedRecords).toHaveLength(0)
      expect(orderRecord.getString('status')).toBe('pending')
    })

    it('marks order paid only when signature is valid, fresh, paid, and amount matches', () => {
      const { routes, savedRecords } = loadStripeRoutes({
        env: { STRIPE_WEBHOOK_SECRET: WEBHOOK_SECRET },
        records: { orders: { ord_1: orderRecord } },
      })

      const rawBody = JSON.stringify({
        type: 'checkout.session.completed',
        data: { object: { client_reference_id: 'ord_1', payment_status: 'paid', amount_total: 1000 } },
      })
      const validSig = signPayload(rawBody)

      const res = routes['POST /api/stripe/webhook'](
        makeEvent({ rawBody, headers: { 'Stripe-Signature': validSig } })
      )

      expect(res.status).toBe(200)
      expect(savedRecords).toHaveLength(1)
      expect(orderRecord.getString('status')).toBe('paid')
    })
  })
})

describe('Security: pb_hooks/seo.pb.js XSS and filter injection', () => {
  function loadSeoRoutes({ products = [], categories = [] } = {}) {
    const routes = {}
    global.__hooks = path.resolve(process.cwd(), 'pb_hooks')
    global.routerAdd = (method, routePath, handler) => {
      routes[`${method.toUpperCase()} ${routePath}`] = handler
    }
    global.$os = {
      getenv: vi.fn(() => ''),
      readFile: vi.fn(
        () => '<html><head><title>Old</title><meta name="description" content="old" /></head><body><div id="app"></div></body></html>'
      ),
    }
    global.$filepath = {
      join: vi.fn((...parts) => parts.join('/')),
    }
    global.toString = (v) => String(v ?? '')
    global.$app = {
      findRecordsByFilter: vi.fn((collection) => {
        if (collection === 'products') return products
        if (collection === 'categories') return categories
        return []
      }),
      findFirstRecordByData: vi.fn((collection, field, val) => {
        if (collection === 'products' && field === 'slug') {
          const found = products.find((p) => p.getString('slug') === val)
          if (!found) throw new Error('not found')
          return found
        }
        if (collection === 'categories' && field === 'slug') {
          const found = categories.find((c) => c.getString('slug') === val)
          if (!found) throw new Error('not found')
          return found
        }
        throw new Error('not found')
      }),
      findRecordById: vi.fn(() => {
        throw new Error('not found')
      }),
    }

    delete require.cache[require.resolve('../pb_hooks/lib/seo.js')]
    const hookPath = path.resolve(process.cwd(), 'pb_hooks/seo.pb.js')
    const code = fs.readFileSync(hookPath, 'utf8')
    new Function('require', code)(require)
    return routes
  }

  it('does not interpolate raw category query param into PocketBase filter', () => {
    const routes = loadSeoRoutes()
    const payload = `' || status = 'draft`

    const res = routes['GET /shop']({
      requestInfo: () => ({ headers: { host: 'store.example.com' } }),
      request: {
        tls: true,
        url: {
          path: '/shop',
          query: () => ({ get: (k) => (k === 'category' ? payload : '') }),
        },
      },
      html: (status, body) => ({ status, body }),
    })

    expect(res.status).toBe(200)
    expect(global.$app.findFirstRecordByData).toHaveBeenCalledWith('categories', 'slug', payload)
    // Filter passed to products must remain strictly status = 'active'
    expect(global.$app.findRecordsByFilter).toHaveBeenCalledWith(
      'products',
      "status = 'active'",
      '-created',
      60,
      0
    )
  })

  it('escapes XSS and JSON-LD script breakout payloads in product pages', () => {
    const xssProduct = makeRecord('prod_xss', {
      name: '<img src=x onerror=alert(1)>',
      slug: 'xss-card',
      description: '</script><script>alert("xss")</script>',
      images: ['/card.webp'],
    })
    const routes = loadSeoRoutes({ products: [xssProduct] })

    const res = routes['GET /shop/card/{slug}']({
      requestInfo: () => ({ headers: { host: 'store.example.com' } }),
      request: {
        tls: true,
        pathValue: () => 'xss-card',
        url: { path: '/shop/card/xss-card', query: () => ({ get: () => '' }) },
      },
      html: (status, body) => ({ status, body }),
    })

    expect(res.status).toBe(200)
    expect(res.body).not.toContain('<img src=x onerror=alert(1)>')
    expect(res.body).not.toContain('<script>alert("xss")</script>')
    expect(res.body).toContain('&lt;img src=x onerror=alert(1)&gt;')
    expect(res.body).toContain('\\u003c/script>')
  })
})
