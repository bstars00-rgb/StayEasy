// Locale tags for Intl formatting, keyed by app language code.
const INTL_LOCALE = { en: 'en-US', ko: 'ko-KR', vi: 'vi-VN', zh: 'zh-CN', ja: 'ja-JP' }

export function formatMoney(amount, currency, lang) {
  if (amount == null || amount === '') return ''
  const locale = INTL_LOCALE[lang] || 'en-US'
  const num = Number(amount)
  if (Number.isNaN(num)) return `${amount} ${currency || ''}`.trim()
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(num)
  } catch {
    return `${num.toLocaleString()} ${currency || ''}`.trim()
  }
}

// Convenience wrapper for the membership price shape { amount, currency }.
export function formatPrice(price, lang) {
  if (!price) return ''
  return formatMoney(price.amount, price.currency, lang)
}

export function formatDate(isoDate, lang) {
  if (!isoDate) return ''
  const locale = INTL_LOCALE[lang] || 'en-US'
  const d = new Date(isoDate)
  if (Number.isNaN(d.getTime())) return isoDate
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

// Whole days from today (local) until the given date. Negative => past.
export function daysUntil(isoDate) {
  if (!isoDate) return null
  const target = new Date(isoDate)
  if (Number.isNaN(target.getTime())) return null
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const today = startOfDay(new Date())
  const t = startOfDay(target)
  return Math.round((t - today) / 86400000)
}
