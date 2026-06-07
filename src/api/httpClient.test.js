import { describe, it, expect } from 'vitest'
import { buildUrl } from './httpClient.js'

describe('buildUrl', () => {
  it('joins base and path with a single slash', () => {
    expect(buildUrl('https://api.stayeasy.app', '/me/orders')).toBe('https://api.stayeasy.app/me/orders')
    expect(buildUrl('https://api.stayeasy.app/', 'me/orders')).toBe('https://api.stayeasy.app/me/orders')
  })

  it('appends a query string, skipping null/empty values', () => {
    expect(buildUrl('', '/memberships', { city: 'hanoi', benefit: '', q: null })).toBe('/memberships?city=hanoi')
  })

  it('url-encodes query values', () => {
    expect(buildUrl('', '/x', { name: 'a b&c' })).toBe('/x?name=a%20b%26c')
  })

  it('works with an empty base (same-origin)', () => {
    expect(buildUrl('', '/auth/me')).toBe('/auth/me')
  })
})
