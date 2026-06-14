import { describe, it, expect } from 'vitest'
import { voucherI18n, localizeVoucher } from './voucherI18n.js'
import { voucherPacks } from './voucherPacks.js'

const allTemplates = Object.values(voucherPacks).flat()

describe('localizeVoucher', () => {
  const sample = { templateId: 'cm-dinner', title: 'EN', description: 'EN desc', note: 'EN note', category: 'dining' }

  it('returns the template unchanged for English / missing lang', () => {
    expect(localizeVoucher(sample, 'en')).toBe(sample)
    expect(localizeVoucher(sample, undefined)).toBe(sample)
  })

  it('localizes title/description/note for a known template + lang', () => {
    const ko = localizeVoucher(sample, 'ko')
    expect(ko.title).toBe(voucherI18n['cm-dinner'].ko.title)
    expect(ko.description).toBe(voucherI18n['cm-dinner'].ko.description)
    expect(ko.note).toBe(voucherI18n['cm-dinner'].ko.note)
    // non-text fields pass through untouched
    expect(ko.category).toBe('dining')
  })

  it('falls back to English for an unknown template id', () => {
    const unknown = { templateId: 'does-not-exist', title: 'EN', category: 'room' }
    expect(localizeVoucher(unknown, 'ja')).toBe(unknown)
  })

  it('handles null/undefined templates safely', () => {
    expect(localizeVoucher(null, 'ko')).toBe(null)
    expect(localizeVoucher(undefined, 'ko')).toBe(undefined)
  })

  it('prefers inline template.i18n over the static map and English', () => {
    // Admin-authored voucher (not in the static map) with inline translations.
    const v = { templateId: 'admin-made', title: 'EN', description: 'EN desc', note: 'EN note', i18n: { ko: { title: '한글 제목', description: '한글 설명', note: '한글 노트' } } }
    const ko = localizeVoucher(v, 'ko')
    expect(ko.title).toBe('한글 제목')
    expect(ko.description).toBe('한글 설명')
    expect(ko.note).toBe('한글 노트')
    // a language with no inline entry falls back to English
    expect(localizeVoucher(v, 'ja')).toBe(v)
  })

  it('inline i18n wins over the static map for known template ids', () => {
    const v = { ...sample, i18n: { ko: { title: 'OVERRIDE' } } }
    const ko = localizeVoucher(v, 'ko')
    expect(ko.title).toBe('OVERRIDE')
    // unspecified fields fall back to the static map, then English
    expect(ko.description).toBe(voucherI18n['cm-dinner'].ko.description)
  })
})

describe('voucherI18n coverage', () => {
  const langs = ['ko', 'vi', 'zh', 'ja']

  it('covers every catalog template id in all 4 languages', () => {
    for (const tpl of allTemplates) {
      const entry = voucherI18n[tpl.templateId]
      expect(entry, `missing i18n for ${tpl.templateId}`).toBeTruthy()
      for (const lang of langs) {
        expect(entry[lang], `missing ${lang} for ${tpl.templateId}`).toBeTruthy()
        expect(entry[lang].title, `empty ${lang} title for ${tpl.templateId}`).toBeTruthy()
        expect(entry[lang].description, `empty ${lang} desc for ${tpl.templateId}`).toBeTruthy()
        expect(entry[lang].note, `empty ${lang} note for ${tpl.templateId}`).toBeTruthy()
      }
    }
  })

  it('has no stray i18n ids that are not in the catalog', () => {
    const catalogIds = new Set(allTemplates.map((t) => t.templateId))
    for (const id of Object.keys(voucherI18n)) {
      expect(catalogIds.has(id), `stray i18n id ${id}`).toBe(true)
    }
  })
})
