import { describe, it, expect } from 'vitest'
import { getAvailability, evaluateDate, firstAvailableDate, toIsoDate, WEEKDAYS, ALL_DAYS } from './availability.js'

const vn = { country: 'vietnam' }
const dining = { category: 'dining', templateId: 'x-dining', validUntil: '2026-12-31' }
const weekdayOnly = { category: 'discount', templateId: 'cm-fnb50', validUntil: '2026-12-31' } // override → weekdays
const spa = { category: 'spa', templateId: 'x-spa', validUntil: '2026-12-31' } // lead 2

describe('getAvailability', () => {
  it('applies category defaults', () => {
    const r = getAvailability(vn, dining)
    expect(r.daysOfWeek).toEqual(ALL_DAYS)
    expect(r.minLeadDays).toBe(0)
  })
  it('applies per-template override (weekday-only)', () => {
    expect(getAvailability(vn, weekdayOnly).daysOfWeek).toEqual(WEEKDAYS)
  })
  it('injects the membership country holidays as blackouts', () => {
    const keys = getAvailability(vn, dining).blackouts.map((b) => b.key)
    expect(keys).toContain('tet')
  })
})

describe('evaluateDate', () => {
  const today = new Date(2026, 5, 10) // Wed Jun 10 2026
  const rDining = getAvailability(vn, dining)
  const rWeekday = getAvailability(vn, weekdayOnly)
  const rSpa = getAvailability(vn, spa)

  it('accepts a valid weekday', () => {
    expect(evaluateDate(rDining, '2026-06-10', today)).toEqual({ ok: true })
  })
  it('rejects a past date', () => {
    expect(evaluateDate(rDining, '2026-06-09', today).reason).toBe('past')
  })
  it('rejects weekends for a weekday-only voucher', () => {
    expect(evaluateDate(rWeekday, '2026-06-13', today).reason).toBe('weekend') // Sat
  })
  it('rejects dates inside a holiday blackout', () => {
    const feb = new Date(2026, 1, 10) // before Tết
    const res = evaluateDate(rDining, '2026-02-16', feb)
    expect(res.reason).toBe('holiday')
    expect(res.holidayKey).toBe('tet')
  })
  it('enforces minimum lead time', () => {
    expect(evaluateDate(rSpa, '2026-06-11', today).reason).toBe('leadTime') // +1 day < 2
  })
  it('rejects dates too far ahead', () => {
    expect(evaluateDate(rDining, '2026-11-07', today).reason).toBe('tooFar') // +150 > 120
  })
  it('rejects dates after the voucher expiry', () => {
    const r = getAvailability(vn, { category: 'dining', templateId: 'x', validUntil: '2026-06-20' })
    expect(evaluateDate(r, '2026-06-25', today).reason).toBe('expired')
  })
})

describe('firstAvailableDate', () => {
  it('returns today when it is bookable', () => {
    const today = new Date(2026, 5, 10) // Wed
    expect(toIsoDate(firstAvailableDate(getAvailability(vn, dining), today))).toBe('2026-06-10')
  })
  it('skips the weekend for a weekday-only voucher', () => {
    const sat = new Date(2026, 5, 13) // Sat
    expect(toIsoDate(firstAvailableDate(getAvailability(vn, weekdayOnly), sat))).toBe('2026-06-15') // Mon
  })
})
