import { describe, it, expect } from 'vitest'
import { formatPrice, formatDate } from '../src/utils/formatters.js'

describe('Formatters Utility', () => {
  describe('formatPrice', () => {
    it('formats a normal float price correctly', () => {
      expect(formatPrice(4.99)).toBe('$4.99')
      expect(formatPrice(10)).toBe('$10.00')
      expect(formatPrice(0)).toBe('$0.00')
    })

    it('formats string numbers correctly', () => {
      expect(formatPrice('5.5')).toBe('$5.50')
    })

    it('handles null, undefined, and NaN with fallback', () => {
      expect(formatPrice(null)).toBe('$0.00')
      expect(formatPrice(undefined)).toBe('$0.00')
      expect(formatPrice('invalid', 'N/A')).toBe('N/A')
    })
  })

  describe('formatDate', () => {
    it('returns "-" for null or empty input', () => {
      expect(formatDate(null)).toBe('-')
      expect(formatDate('')).toBe('-')
    })

    it('formats ISO date strings correctly', () => {
      const res = formatDate('2026-11-12T12:00:00Z')
      expect(res).toMatch(/Nov\s+12,\s+2026/)
    })

    it('returns "-" for invalid date inputs', () => {
      expect(formatDate('not-a-date')).toBe('-')
    })
  })
})

