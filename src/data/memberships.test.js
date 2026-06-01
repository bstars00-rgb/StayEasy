import { describe, it, expect } from 'vitest'
import { getMembership, getPricing, isPaid } from './memberships.js'

describe('isPaid', () => {
  it('is true for a paid membership', () => {
    expect(isPaid(getMembership('club-marriott-vietnam'))).toBe(true)
  })
  it('is false for a free membership', () => {
    expect(isPaid(getMembership('hilton-honors-vietnam'))).toBe(false)
  })
})

describe('getPricing', () => {
  it('applies the sale price and computes commission for a paid membership', () => {
    const p = getPricing(getMembership('club-marriott-vietnam'))
    expect(p.listPrice).toBe(4500000)
    expect(p.salePrice).toBe(4200000)
    expect(p.paidAmount).toBe(4200000)
    expect(p.commissionRate).toBe(0.12)
    // 4,200,000 * 0.12 = 504,000
    expect(p.commissionAmount).toBe(504000)
  })

  it('has no sale price or commission for a free membership', () => {
    const p = getPricing(getMembership('hilton-honors-vietnam'))
    expect(p.salePrice).toBeNull()
    expect(p.paidAmount).toBe(0)
    expect(p.commissionAmount).toBe(0)
  })

  it('returns null for an unknown membership', () => {
    expect(getPricing(undefined)).toBeNull()
  })
})
