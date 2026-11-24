import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createRequire } from 'node:module'
import { createHmac, timingSafeEqual } from 'node:crypto'

const require = createRequire(import.meta.url)

describe('pb_hooks/lib/stripe.js', () => {
  let stripeLib

  beforeEach(() => {
    global.$http = { send: vi.fn() }
    global.$app = { save: vi.fn() }
    global.$security = {
      hs256: vi.fn((payload, secret) =>
        createHmac('sha256', secret).update(String(payload)).digest('hex')
      ),
      equal: vi.fn((a, b) => {
        const bufA = Buffer.from(String(a))
        const bufB = Buffer.from(String(b))
        return bufA.length === bufB.length && timingSafeEqual(bufA, bufB)
      }),
    }

    delete require.cache[require.resolve('../pb_hooks/lib/stripe.js')]
    stripeLib = require('../pb_hooks/lib/stripe.js')
  })

  it('calculates totals with coupons, shipping threshold, and 8% tax', () => {
    const items = [{ price: 10, quantity: 2 }]
    const totals = stripeLib.calculateOrderTotals(items, 'POCKET10')
    expect(totals.rawSubtotal).toBe(20)
    expect(totals.discountAmount).toBe(2)
    expect(totals.shippingAmount).toBe(4.99)
    expect(totals.taxAmount).toBeCloseTo(1.44, 5)
    expect(totals.computedTotal).toBeCloseTo(24.43, 5)
  })

  it('verifies valid webhook signatures and rejects expired/invalid ones', () => {
    const secret = 'whsec_test'
    const rawBody = '{"type":"checkout.session.completed"}'
    const now = 1700000000
    const sig = createHmac('sha256', secret).update(`${now}.${rawBody}`).digest('hex')

    expect(stripeLib.verifyWebhookSignature(rawBody, `t=${now},v1=${sig}`, secret, now)).toEqual({
      valid: true,
    })

    expect(
      stripeLib.verifyWebhookSignature(rawBody, `t=${now - 400},v1=${sig}`, secret, now).valid
    ).toBe(false)

    expect(
      stripeLib.verifyWebhookSignature(rawBody, `t=${now},v1=deadbeef`, secret, now).valid
    ).toBe(false)
  })

  it('marks order paid only when paidCents meets expected total and order is not already paid', () => {
    const data = { status: 'pending', total_amount: 20 }
    const order = {
      get: (k) => data[k],
      getString: (k) => String(data[k] ?? ''),
      set: (k, v) => {
        data[k] = v
      },
    }

    expect(stripeLib.markOrderPaid(order, 1500)).toBe(false)
    expect(data.status).toBe('pending')

    expect(stripeLib.markOrderPaid(order, 2000)).toBe(true)
    expect(data.status).toBe('paid')
    expect(global.$app.save).toHaveBeenCalledTimes(1)

    expect(stripeLib.markOrderPaid(order, 2000)).toBe(false)
  })
})
