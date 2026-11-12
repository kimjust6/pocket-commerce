/**
 * Formats a numeric value into a USD currency string.
 * @param {number|string} amount
 * @param {string} fallback
 * @returns {string}
 */
export function formatPrice(amount, fallback = '$0.00') {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return fallback
  }
  return `$${Number(amount).toFixed(2)}`
}

/**
 * Formats an ISO date string into a human-readable date.
 * @param {string|Date} date
 * @param {Intl.DateTimeFormatOptions} options
 * @returns {string}
 */
export function formatDate(date, options = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!date) return '-'
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) return '-'
    return d.toLocaleDateString('en-US', options)
  } catch {
    return '-'
  }
}

