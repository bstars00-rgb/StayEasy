import { describe, it, expect } from 'vitest'
import { translate } from './translations.js'

describe('translate', () => {
  it('resolves a key for the requested language', () => {
    expect(translate('ko', 'nav.home')).toBe('홈')
    expect(translate('en', 'nav.home')).toBe('Home')
  })

  it('interpolates variables', () => {
    expect(translate('en', 'home.popularIn', { city: 'Hanoi' })).toBe('Selected for Hanoi')
  })

  it('falls back to English when a language is missing the key', () => {
    // `voucher.packPreview` exists; simulate a missing-lang lookup via a key
    // only guaranteed in English by checking fallback path returns a string.
    const result = translate('zz', 'nav.home')
    expect(result).toBe('Home') // unknown lang -> English fallback
  })

  it('returns the raw key when nothing is found', () => {
    expect(translate('en', 'totally.missing.key')).toBe('totally.missing.key')
  })

  it('leaves unmatched placeholders intact', () => {
    expect(translate('en', 'home.popularIn')).toBe('Selected for {city}')
  })
})
