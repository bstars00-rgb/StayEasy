import { describe, it, expect } from 'vitest'
import { translations, LANGUAGES } from './translations.js'

// Flatten a nested dictionary into sorted dotted key paths (leaves only).
function keyPaths(obj, prefix = '') {
  const out = []
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) out.push(...keyPaths(v, p))
    else out.push(p)
  }
  return out
}

// Every language must define exactly the same keys as English — catches a
// translation added to one language but forgotten in another.
describe('i18n key parity', () => {
  const en = new Set(keyPaths(translations.en))
  for (const { code } of LANGUAGES) {
    if (code === 'en') continue
    it(`${code} has the same keys as en`, () => {
      const keys = new Set(keyPaths(translations[code]))
      const missing = [...en].filter((k) => !keys.has(k)).sort()
      const extra = [...keys].filter((k) => !en.has(k)).sort()
      expect({ missing, extra }).toEqual({ missing: [], extra: [] })
    })
  }
})
