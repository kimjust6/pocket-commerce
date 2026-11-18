// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import { updateSeoMeta, buildProductJsonLd, buildWebsiteJsonLd, resolveAbsoluteUrl } from '../src/utils/seo.js'

describe('SEO Utility', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
    document.title = ''
  })

  it('resolves relative paths and preserves absolute URLs', () => {
    expect(resolveAbsoluteUrl('/shop', 'https://example.com/')).toBe('https://example.com/shop')
    expect(resolveAbsoluteUrl('https://cdn.example.com/a.webp', 'https://example.com')).toBe(
      'https://cdn.example.com/a.webp'
    )
  })

  it('updates document title, meta tags, canonical link, and JSON-LD', () => {
    const productSchema = buildProductJsonLd(
      {
        id: 'prd_1',
        name: 'Birthday Cat',
        slug: 'birthday-cat',
        description: 'A funny cat card.',
        price: 5.5,
        primaryImage: '/card-birthday.webp',
        reviews: [{ rating: 5 }, { rating: 4 }],
      },
      'https://pocket.example'
    )

    updateSeoMeta({
      title: 'Birthday Cat',
      description: 'A funny cat card.',
      image: '/card-birthday.webp',
      type: 'product',
      canonicalPath: '/shop/card/birthday-cat',
      jsonLd: productSchema,
    })

    expect(document.title).toBe('Birthday Cat | Pocket Commerce')
    expect(document.head.querySelector('meta[name="description"]').getAttribute('content')).toBe('A funny cat card.')
    expect(document.head.querySelector('meta[name="robots"]').getAttribute('content')).toBe('index, follow')
    expect(document.head.querySelector('meta[property="og:type"]').getAttribute('content')).toBe('product')
    expect(document.head.querySelector('link[rel="canonical"]').getAttribute('href')).toContain('/shop/card/birthday-cat')

    const ld = JSON.parse(document.head.querySelector('script#seo-json-ld').textContent)
    expect(ld['@type']).toBe('Product')
    expect(ld.offers.price).toBe('5.50')
    expect(ld.aggregateRating.ratingValue).toBe('4.5')
    expect(ld.aggregateRating.reviewCount).toBe(2)
  })

  it('removes JSON-LD when jsonLd is null and supports noindex', () => {
    updateSeoMeta({
      title: 'Home',
      jsonLd: buildWebsiteJsonLd('https://pocket.example'),
    })
    expect(document.head.querySelector('script#seo-json-ld')).not.toBeNull()

    updateSeoMeta({
      title: 'Cart',
      robots: 'noindex, nofollow',
      jsonLd: null,
    })
    expect(document.head.querySelector('script#seo-json-ld')).toBeNull()
    expect(document.head.querySelector('meta[name="robots"]').getAttribute('content')).toBe('noindex, nofollow')
  })
})

