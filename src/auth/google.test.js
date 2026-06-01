import { describe, it, expect } from 'vitest'
import { parseGoogleCredential, demoUser, isRealGoogleEnabled } from './google.js'

// Build an unsigned JWT (header.payload.signature) with a base64url UTF-8 payload.
function makeJwt(payload) {
  const b64url = (obj) =>
    Buffer.from(JSON.stringify(obj), 'utf-8').toString('base64').replace(/=+$/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  return `${b64url({ alg: 'none', typ: 'JWT' })}.${b64url(payload)}.`
}

describe('parseGoogleCredential', () => {
  it('extracts a profile from a Google ID token', () => {
    const jwt = makeJwt({ sub: '12345', name: 'Jane Doe', email: 'jane@gmail.com', picture: 'http://x/p.png' })
    expect(parseGoogleCredential(jwt)).toEqual({
      id: '12345',
      provider: 'google',
      name: 'Jane Doe',
      email: 'jane@gmail.com',
      picture: 'http://x/p.png',
    })
  })

  it('decodes UTF-8 names correctly', () => {
    const jwt = makeJwt({ sub: '9', name: '이지영', email: 'lee@gmail.com' })
    expect(parseGoogleCredential(jwt).name).toBe('이지영')
  })

  it('falls back to email then a default for the name', () => {
    const jwt = makeJwt({ sub: '1', email: 'only@gmail.com' })
    expect(parseGoogleCredential(jwt).name).toBe('only@gmail.com')
  })

  it('throws on a malformed credential', () => {
    expect(() => parseGoogleCredential('not-a-jwt')).toThrow()
  })
})

describe('demoUser', () => {
  it('returns a google demo profile', () => {
    const u = demoUser()
    expect(u.provider).toBe('google')
    expect(u.email).toContain('@')
    expect(u.id).toBeTruthy()
    expect(u.demo).toBe(true)
  })
})

describe('isRealGoogleEnabled', () => {
  it('is false without a configured client id', () => {
    // No VITE_GOOGLE_CLIENT_ID in the test env.
    expect(isRealGoogleEnabled()).toBe(false)
  })
})
