import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

function setupGlobals(env = {}) {
  global.$os = {
    getenv: vi.fn((k) => env[k] || ''),
    readFile: vi.fn(() => '<html><head><title>Old</title><meta name="description" content="old" /></head><body><div id="app"></div></body></html>'),
  }
  global.$filepath = {
    join: vi.fn((...parts) => parts.join('/')),
  }
  global.toString = (v) => String(v)
  global.$app = {
    findRecordsByFilter: vi.fn(() => []),
  }
}

describe('pb_hooks/lib/seo.js', () => {
  let seo

  beforeEach(() => {
    setupGlobals()
    delete require.cache[require.resolve('../pb_hooks/lib/seo.js')]
    seo = require('../pb_hooks/lib/seo.js')
  })

  it('escapes HTML special characters', () => {
    expect(seo.escapeHtml(`<script>"a' & b</script>`)).toBe(
      '&lt;script&gt;&quot;a&#39; &amp; b&lt;/script&gt;'
    )
  })

  it('resolves relative paths and preserves absolute URLs', () => {
    expect(seo.resolveUrl('/shop', 'https://example.com')).toBe('https://example.com/shop')
    expect(seo.resolveUrl('shop', 'https://example.com')).toBe('https://example.com/shop')
    expect(seo.resolveUrl('https://cdn.example.com/x.webp', 'https://example.com')).toBe(
      'https://cdn.example.com/x.webp'
    )
  })

  it('parses product images from arrays, JSON strings, plain strings, and empty values', () => {
    expect(seo.parseProductImages(['/a.webp'])).toEqual(['/a.webp'])
    expect(seo.parseProductImages('["/b.webp"]')).toEqual(['/b.webp'])
    expect(seo.parseProductImages('/c.webp')).toEqual(['/c.webp'])
    expect(seo.parseProductImages(null)).toEqual([seo.DEFAULT_IMAGE])
  })

  it('derives origin from APP_URL or forwarded headers', () => {
    setupGlobals({ APP_URL: 'https://cards.example.com/' })
    expect(seo.getOrigin({ requestInfo: () => ({ headers: {} }), request: {} })).toBe(
      'https://cards.example.com'
    )

    setupGlobals({})
    const origin = seo.getOrigin({
      requestInfo: () => ({
        headers: { 'x-forwarded-proto': 'https', 'x-forwarded-host': 'proxy.example.com' },
      }),
      request: { tls: false },
    })
    expect(origin).toBe('https://proxy.example.com')
  })

  it('injects SEO tags, escapes JSON-LD script breakouts, and populates #app bodyHtml', () => {
    const html = seo.renderSeoHtml('https://store.example.com', '/hooks', {
      title: 'Birthday Cat',
      description: 'Cute card',
      canonicalPath: '/shop/card/birthday-cat',
      bodyHtml: '<h1>Birthday Cat</h1>',
      jsonLd: { '@type': 'Product', name: '</script><script>alert(1)' },
    })

    expect(html).toContain('<title>Birthday Cat | Pocket Commerce</title>')
    expect(html).not.toContain('<title>Old</title>')
    expect(html).toContain('<link rel="canonical" href="https://store.example.com/shop/card/birthday-cat" />')
    expect(html).toContain('\\u003c/script>')
    expect(html).toContain('<div id="app"><h1>Birthday Cat</h1></div>')
  })
})

