import { describe, it, expect } from 'vitest'
import { membershipI18n, localizeMembership } from './membershipI18n.js'
import { memberships } from './memberships.js'

describe('localizeMembership', () => {
  const sample = memberships.find((m) => m.id === 'club-marriott-vietnam')

  it('returns the membership unchanged for English / missing lang', () => {
    expect(localizeMembership(sample, 'en')).toBe(sample)
    expect(localizeMembership(sample, undefined)).toBe(sample)
  })

  it('localizes benefits + notes for a known id + lang', () => {
    const ko = localizeMembership(sample, 'ko')
    expect(ko.benefits).toEqual(membershipI18n['club-marriott-vietnam'].ko.benefits)
    expect(ko.notes).toBe(membershipI18n['club-marriott-vietnam'].ko.notes)
    // non-localized fields pass through
    expect(ko.annualFee).toBe(sample.annualFee)
    expect(ko.scores).toBe(sample.scores)
  })

  it('falls back to English benefits if the localized length mismatches', () => {
    const m = { id: 'x', benefits: ['a', 'b', 'c'], notes: 'EN' }
    // not in the map → unchanged
    expect(localizeMembership(m, 'ko')).toBe(m)
  })

  it('handles null/undefined safely', () => {
    expect(localizeMembership(null, 'ko')).toBe(null)
    expect(localizeMembership(undefined, 'ko')).toBe(undefined)
  })
})

describe('membershipI18n coverage', () => {
  const langs = ['ko', 'vi', 'zh', 'ja']

  it('covers every membership in all 4 languages with matching benefit counts', () => {
    for (const m of memberships) {
      const entry = membershipI18n[m.id]
      expect(entry, `missing i18n for ${m.id}`).toBeTruthy()
      for (const lang of langs) {
        const tr = entry[lang]
        expect(tr, `missing ${lang} for ${m.id}`).toBeTruthy()
        expect(tr.benefits.length, `${lang} benefit count for ${m.id}`).toBe(m.benefits.length)
        for (const b of tr.benefits) expect(b, `empty ${lang} benefit for ${m.id}`).toBeTruthy()
        expect(tr.notes, `empty ${lang} notes for ${m.id}`).toBeTruthy()
      }
    }
  })

  it('has no stray ids that are not in the catalog', () => {
    const ids = new Set(memberships.map((m) => m.id))
    for (const id of Object.keys(membershipI18n)) expect(ids.has(id), `stray id ${id}`).toBe(true)
  })
})
