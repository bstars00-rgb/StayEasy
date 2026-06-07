import { describe, it, expect } from 'vitest'
import { childPolicyHints } from './childPolicy.js'

describe('childPolicyHints', () => {
  it('buckets dining ages into free (<6) and child rate (6-12)', () => {
    expect(childPolicyHints('dining', [3, 8, 14])).toEqual([
      { key: 'diningFree', count: 1 },
      { key: 'diningHalf', count: 1 },
    ])
  })

  it('treats discount and gift like dining', () => {
    expect(childPolicyHints('discount', [5]).map((h) => h.key)).toEqual(['diningFree'])
    expect(childPolicyHints('gift', [10]).map((h) => h.key)).toEqual(['diningHalf'])
  })

  it('room: free under 12, extra bed at 12+', () => {
    expect(childPolicyHints('room', [4, 12])).toEqual([
      { key: 'roomFree', count: 1 },
      { key: 'roomExtra', count: 1 },
    ])
  })

  it('spa: restricted under 16', () => {
    expect(childPolicyHints('spa', [10, 17])).toEqual([{ key: 'spaRestricted', count: 1 }])
  })

  it('returns nothing for no children or other category', () => {
    expect(childPolicyHints('dining', [])).toEqual([])
    expect(childPolicyHints('other', [5])).toEqual([])
  })
})
