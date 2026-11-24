export function setMetaTag(attrName, attrValue, content, doc = typeof document !== 'undefined' ? document : null) {
  if (!doc) return
  let el = doc.head.querySelector(`meta[${attrName}="${attrValue}"]`)
  if (!el) {
    el = doc.createElement('meta')
    el.setAttribute(attrName, attrValue)
    doc.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function setCanonicalLink(url, doc = typeof document !== 'undefined' ? document : null) {
  if (!doc) return
  let link = doc.head.querySelector('link[rel="canonical"]')
  if (!link) {
    link = doc.createElement('link')
    link.setAttribute('rel', 'canonical')
    doc.head.appendChild(link)
  }
  link.setAttribute('href', url)
}

export function setJsonLd(data, doc = typeof document !== 'undefined' ? document : null) {
  if (!doc) return
  const existing = doc.head.querySelector('script#seo-json-ld')
  if (!data) {
    if (existing) existing.remove()
    return
  }
  const script = existing || doc.createElement('script')
  script.id = 'seo-json-ld'
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(data)
  if (!existing) {
    doc.head.appendChild(script)
  }
}
