import { describe, it, expect } from 'vitest'
import { distanceKm, nearestCity } from './geo.js'
import { cities } from '../data/cities.js'

describe('distanceKm', () => {
  it('is ~0 for the same point', () => {
    expect(distanceKm({ lat: 10.78, lng: 106.7 }, { lat: 10.78, lng: 106.7 })).toBeLessThan(0.001)
  })
  it('matches a known distance (HCMC ↔ Hanoi ≈ 1140km)', () => {
    const km = distanceKm({ lat: 10.7769, lng: 106.7009 }, { lat: 21.0285, lng: 105.8542 })
    expect(km).toBeGreaterThan(1100)
    expect(km).toBeLessThan(1200)
  })
})

describe('nearestCity', () => {
  it('picks Seoul for a point in Korea', () => {
    expect(nearestCity({ lat: 37.45, lng: 126.7 }, cities).id).toBe('seoul')
  })
  it('picks Tokyo for a point in Japan', () => {
    expect(nearestCity({ lat: 34.69, lng: 135.5 }, cities).id).toBe('tokyo')
  })
  it('picks Ho Chi Minh for a point in southern Vietnam', () => {
    expect(nearestCity({ lat: 10.9, lng: 106.8 }, cities).id).toBe('ho-chi-minh')
  })
  it('returns null for invalid input', () => {
    expect(nearestCity(null, cities)).toBe(null)
    expect(nearestCity({ lat: NaN, lng: 1 }, cities)).toBe(null)
  })
})
