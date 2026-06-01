import { describe, it, expect } from 'vitest'
import { formatMoney, daysUntil } from './format.js'

describe('formatMoney', () => {
  it('formats VND without decimals', () => {
    const out = formatMoney(4200000, 'VND', 'en')
    expect(out).toContain('4,200,000')
  })

  it('formats USD', () => {
    expect(formatMoney(350, 'USD', 'en')).toContain('350')
  })

  it('returns empty string for null amount', () => {
    expect(formatMoney(null, 'VND', 'en')).toBe('')
  })
})

describe('daysUntil', () => {
  const isoFromOffset = (days) => {
    const d = new Date()
    d.setDate(d.getDate() + days)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  it('is positive for a future date', () => {
    expect(daysUntil(isoFromOffset(10))).toBeGreaterThan(0)
  })

  it('is negative for a past date', () => {
    expect(daysUntil(isoFromOffset(-10))).toBeLessThan(0)
  })

  it('advances by the same delta regardless of timezone', () => {
    // Difference is timezone-robust even if absolute value shifts by a day.
    expect(daysUntil(isoFromOffset(10)) - daysUntil(isoFromOffset(5))).toBe(5)
  })

  it('returns null for an invalid date', () => {
    expect(daysUntil('not-a-date')).toBeNull()
  })
})
