// Per-voucher booking availability rules + a pure date evaluator.
//
// Each voucher resolves to a rule:
//   daysOfWeek    allowed weekdays (0=Sun..6=Sat). Omit = all days.
//   minLeadDays   earliest bookable = today + minLeadDays
//   maxAdvanceDays latest bookable = today + maxAdvanceDays
//   blackouts     [{ from, to, key }] inclusive closed ranges (holidays, etc.)
//   validUntil    voucher expiry (no booking after this)
//
// Rules are resolved from: category defaults → per-template overrides →
// the membership country's public-holiday blackouts. This is mock data
// structured so a backend can later serve the same shape and enforce it
// server-side (the source of truth for inventory + dates).

export const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]
export const WEEKDAYS = [1, 2, 3, 4, 5]

// Approximate public-holiday closures per country (mock; operator-overridable).
// Lunar New Year 2026 ≈ Feb 17; 2027 ≈ Feb 6. Chuseok 2026 ≈ Sep 25.
const HOLIDAYS = {
  vietnam: [
    { from: '2026-02-14', to: '2026-02-22', key: 'tet' },
    { from: '2027-02-05', to: '2027-02-13', key: 'tet' },
  ],
  korea: [
    { from: '2026-02-16', to: '2026-02-18', key: 'seollal' },
    { from: '2026-09-24', to: '2026-09-27', key: 'chuseok' },
    { from: '2027-02-06', to: '2027-02-09', key: 'seollal' },
  ],
  thailand: [
    { from: '2026-04-13', to: '2026-04-15', key: 'songkran' },
    { from: '2027-04-13', to: '2027-04-15', key: 'songkran' },
  ],
}

// Sensible defaults by voucher category.
const CATEGORY_DEFAULTS = {
  dining: { daysOfWeek: ALL_DAYS, minLeadDays: 0, maxAdvanceDays: 120 },
  discount: { daysOfWeek: ALL_DAYS, minLeadDays: 0, maxAdvanceDays: 120 },
  room: { daysOfWeek: ALL_DAYS, minLeadDays: 2, maxAdvanceDays: 180 },
  spa: { daysOfWeek: ALL_DAYS, minLeadDays: 2, maxAdvanceDays: 120 },
  gift: { daysOfWeek: ALL_DAYS, minLeadDays: 2, maxAdvanceDays: 120 },
  other: { daysOfWeek: ALL_DAYS, minLeadDays: 1, maxAdvanceDays: 120 },
}

// Per-template overrides to model real-world quirks (weekday-only perks, longer
// lead times, etc.). Anything omitted falls back to the category default.
const TEMPLATE_OVERRIDES = {
  'cm-stay2': { minLeadDays: 3 }, // free 2-night stay: book ahead
  'cm-fnb50': { daysOfWeek: WEEKDAYS }, // 50% F&B: weekday everyday-perk
  'ap-dining50': { daysOfWeek: WEEKDAYS }, // 50% dining: weekday only
  'ihg-dining20': { daysOfWeek: WEEKDAYS },
  'cm-cake': { minLeadDays: 2 }, // 48h pre-order
  'nk-cake': { minLeadDays: 2 },
}

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

// Parse 'YYYY-MM-DD' as a LOCAL date (avoids UTC off-by-one).
export function parseLocalDate(iso) {
  if (!iso || typeof iso !== 'string') return null
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return null
  const date = new Date(y, m - 1, d)
  return Number.isNaN(date.getTime()) ? null : date
}

export function toIsoDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const dayDiff = (a, b) => Math.round((startOfDay(a) - startOfDay(b)) / 86400000)

// Resolve the effective rule for a voucher of a given membership.
export function getAvailability(membership, template) {
  const base = CATEGORY_DEFAULTS[template?.category] || CATEGORY_DEFAULTS.other
  const ov = TEMPLATE_OVERRIDES[template?.templateId] || {}
  const holidays = HOLIDAYS[membership?.country] || []
  return {
    daysOfWeek: ov.daysOfWeek || base.daysOfWeek,
    minLeadDays: ov.minLeadDays ?? base.minLeadDays,
    maxAdvanceDays: ov.maxAdvanceDays ?? base.maxAdvanceDays,
    blackouts: [...(base.blackouts || []), ...(ov.blackouts || []), ...holidays],
    validUntil: template?.validUntil || null,
  }
}

function inBlackout(date, blackouts) {
  for (const b of blackouts || []) {
    const from = parseLocalDate(b.from)
    const to = parseLocalDate(b.to)
    if (from && to && date >= startOfDay(from) && date <= startOfDay(to)) return b
  }
  return null
}

/**
 * Evaluate a single date against a rule.
 * @returns { ok, reason?, holidayKey? }
 *   reason ∈ past | leadTime | tooFar | expired | weekend | closed | holiday
 */
export function evaluateDate(rule, iso, today = new Date()) {
  const date = parseLocalDate(iso)
  if (!date || !rule) return { ok: false, reason: 'invalid' }
  const d = startOfDay(date)
  const t0 = startOfDay(today)
  const lead = dayDiff(d, t0)

  if (lead < 0) return { ok: false, reason: 'past' }
  if (rule.validUntil) {
    const exp = parseLocalDate(rule.validUntil)
    if (exp && d > startOfDay(exp)) return { ok: false, reason: 'expired' }
  }
  if (lead < (rule.minLeadDays || 0)) return { ok: false, reason: 'leadTime' }
  if (rule.maxAdvanceDays != null && lead > rule.maxAdvanceDays) return { ok: false, reason: 'tooFar' }

  const hol = inBlackout(d, rule.blackouts)
  if (hol) return { ok: false, reason: 'holiday', holidayKey: hol.key }

  const dow = d.getDay()
  const allowed = rule.daysOfWeek || ALL_DAYS
  if (!allowed.includes(dow)) {
    return { ok: false, reason: dow === 0 || dow === 6 ? 'weekend' : 'closed' }
  }
  return { ok: true }
}

// First bookable date at/after today (within the booking window), or null.
export function firstAvailableDate(rule, today = new Date()) {
  if (!rule) return null
  const max = rule.maxAdvanceDays != null ? rule.maxAdvanceDays : 365
  const base = startOfDay(today)
  for (let i = 0; i <= max; i++) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i)
    if (evaluateDate(rule, toIsoDate(d), today).ok) return d
  }
  return null
}
