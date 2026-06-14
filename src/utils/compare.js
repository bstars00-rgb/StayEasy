// Comparison helpers: given the memberships a user is comparing, work out the
// winning value for each metric so the UI can highlight each option's strengths.
// Highlighting is only meaningful with 2+ items; with fewer we return {} so the
// UI shows no "best" markers.

const NUMERIC = {
  // key: [accessor, direction] — 'max' = higher wins, 'min' = lower wins.
  annualFee: [(m) => (m.annualFee ?? Infinity), 'min'],
  estimatedSavings: [(m) => (m.estimatedSavings ?? -Infinity), 'max'],
  diningDiscount: [(m) => (m.diningDiscount ?? -1), 'max'],
  roomDiscount: [(m) => (m.roomDiscount ?? -1), 'max'],
  cityCoverage: [(m) => (m.cities?.length ?? 0), 'max'],
}

const SCORE_KEYS = ['familyDining', 'staycation', 'businessTravel', 'easeOfUse', 'overall']
const BOOL_KEYS = ['freeNight', 'spaBenefit']

// Returns a map of metricKey → winning value (and boolKey → true when any item
// has it). Scores are namespaced as `score_<key>`.
export function computeBest(items) {
  if (!Array.isArray(items) || items.length < 2) return {}
  const best = {}
  for (const [key, [fn, dir]] of Object.entries(NUMERIC)) {
    const vals = items.map(fn)
    best[key] = dir === 'min' ? Math.min(...vals) : Math.max(...vals)
  }
  for (const k of SCORE_KEYS) {
    best[`score_${k}`] = Math.max(...items.map((m) => m.scores?.[k] ?? -Infinity))
  }
  for (const k of BOOL_KEYS) {
    if (items.some((m) => m[k])) best[k] = true
  }
  return best
}

// True when `value` ties the best for `key`. Guards against the Infinity
// sentinels (a membership missing the field never "wins").
export function isBest(best, key, value) {
  if (!best || !(key in best)) return false
  if (value == null) return false
  if (best[key] === Infinity || best[key] === -Infinity) return false
  return value === best[key]
}
