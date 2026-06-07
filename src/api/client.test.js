import { describe, it, expect } from 'vitest'
import { buildUrl } from './client.js'

describe('buildUrl', () => {
  it('joins base (incl. /api/v1) and path with a single slash', () => {
    expect(buildUrl('https://api.ohmyselect.com/api/v1', '/wallet')).toBe('https://api.ohmyselect.com/api/v1/wallet')
    expect(buildUrl('https://api.ohmyselect.com/api/v1/', 'wallet')).toBe('https://api.ohmyselect.com/api/v1/wallet')
  })

  it('appends a query string, skipping null/empty values', () => {
    expect(buildUrl('', '/memberships', { city: 'hanoi', benefit: '', sort: null })).toBe('/memberships?city=hanoi')
  })

  it('url-encodes query values', () => {
    expect(buildUrl('', '/memberships/compare', { ids: 'a,b,c' })).toBe('/memberships/compare?ids=a%2Cb%2Cc')
  })
})
