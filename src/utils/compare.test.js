import { describe, it, expect } from 'vitest'
import { computeBest, isBest } from './compare.js'

const A = { id: 'a', annualFee: 0, estimatedSavings: 500, diningDiscount: 20, roomDiscount: null, cities: ['x', 'y'], freeNight: true, spaBenefit: false, scores: { familyDining: 9, staycation: 5, businessTravel: 7, easeOfUse: 6, overall: 8 } }
const B = { id: 'b', annualFee: 1000, estimatedSavings: 800, diningDiscount: 15, roomDiscount: 30, cities: ['x'], freeNight: false, spaBenefit: true, scores: { familyDining: 6, staycation: 9, businessTravel: 7, easeOfUse: 8, overall: 7 } }

describe('computeBest', () => {
  it('returns {} with fewer than 2 items', () => {
    expect(computeBest([])).toEqual({})
    expect(computeBest([A])).toEqual({})
    expect(computeBest(null)).toEqual({})
  })

  it('picks min for fee and max for savings/discounts/coverage', () => {
    const best = computeBest([A, B])
    expect(best.annualFee).toBe(0) // A (free) wins
    expect(best.estimatedSavings).toBe(800) // B
    expect(best.diningDiscount).toBe(20) // A
    expect(best.roomDiscount).toBe(30) // B (A's null ignored)
    expect(best.cityCoverage).toBe(2) // A
  })

  it('picks max per score and flags booleans present in any item', () => {
    const best = computeBest([A, B])
    expect(best.score_familyDining).toBe(9) // A
    expect(best.score_staycation).toBe(9) // B
    expect(best.score_businessTravel).toBe(7) // tie
    expect(best.freeNight).toBe(true)
    expect(best.spaBenefit).toBe(true)
  })
})

describe('isBest', () => {
  const best = computeBest([A, B])
  it('marks the winning value (and ties)', () => {
    expect(isBest(best, 'annualFee', 0)).toBe(true)
    expect(isBest(best, 'annualFee', 1000)).toBe(false)
    expect(isBest(best, 'score_businessTravel', 7)).toBe(true) // both tie → both best
  })
  it('never marks a missing/sentinel value', () => {
    expect(isBest(best, 'roomDiscount', null)).toBe(false)
    expect(isBest(best, 'nope', 5)).toBe(false)
    expect(isBest({}, 'annualFee', 0)).toBe(false) // empty (single item)
  })
})
