import { describe, it, expect } from 'vitest'
import { scopeForUser } from './storage.js'

describe('scopeForUser', () => {
  it('returns guest when there is no user', () => {
    expect(scopeForUser(null)).toBe('guest')
    expect(scopeForUser(undefined)).toBe('guest')
    expect(scopeForUser({})).toBe('guest')
  })

  it('namespaces by user id when signed in', () => {
    expect(scopeForUser({ id: 'abc' })).toBe('u_abc')
    expect(scopeForUser({ id: 'demo-google-user' })).toBe('u_demo-google-user')
  })
})
