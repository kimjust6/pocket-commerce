import { setMetaTag, setCanonicalLink, setJsonLd } from './seoDom'

const SITE_NAME = 'Pocket Commerce'
const DEFAULT_DESCRIPTION =
  'Explore our collection of funny, thoughtful, and custom-illustrated cards printed locally on 100% recycled paper stock.'
const DEFAULT_IMAGE = '/og-image.webp'

export function resolveAbsoluteUrl(pathOrUrl, origin) {
  if (!pathOrUrl) return origin || ''
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl
  }
  const base = (origin || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/+$/, '')
  const normalizedPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`
  return `${base}${normalizedPath}`
}

export function buildProductJsonLd(product, origin) {
  if (!product) return null
  const url = resolveAbsoluteUrl(`/shop/card/${product.slug}`, origin)
  const image = resolveAbsoluteUrl(product.primaryImage || DEFAULT_IMAGE, origin)

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || DEFAULT_DESCRIPTION,
    image: [image],
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'USD',
      price: Number(product.price || 4.99).toFixed(2),
      availability: 'https://schema.org/InStock',
    },
  }

  if (Array.isArray(product.reviews) && product.reviews.length > 0) {
    const totalRating = product.reviews.reduce((sum, r) => sum + Number(r.rating || 5), 0)
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: (totalRating / product.reviews.length).toFixed(1),
      reviewCount: product.reviews.length,
    }
  }

  return schema
}

export function buildWebsiteJsonLd(origin) {
  const url = resolveAbsoluteUrl('/', origin)
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${url}shop?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function updateSeoMeta({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  type = 'website',
  robots = 'index, follow',
  canonicalPath,
  jsonLd = null,
} = {}) {
  if (typeof document === 'undefined') return

  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Handcrafted Stationery & Greeting Cards`
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/'
  const canonicalUrl = resolveAbsoluteUrl(canonicalPath || currentPath, origin)
  const imageUrl = resolveAbsoluteUrl(image, origin)

  document.title = fullTitle
  setMetaTag('name', 'description', description)
  setMetaTag('name', 'robots', robots)
  setCanonicalLink(canonicalUrl)

  setMetaTag('property', 'og:site_name', SITE_NAME)
  setMetaTag('property', 'og:type', type)
  setMetaTag('property', 'og:title', fullTitle)
  setMetaTag('property', 'og:description', description)
  setMetaTag('property', 'og:url', canonicalUrl)
  setMetaTag('property', 'og:image', imageUrl)

  setMetaTag('name', 'twitter:card', 'summary_large_image')
  setMetaTag('name', 'twitter:title', fullTitle)
  setMetaTag('name', 'twitter:description', description)
  setMetaTag('name', 'twitter:image', imageUrl)

  setJsonLd(jsonLd)
}
