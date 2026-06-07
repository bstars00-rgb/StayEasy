// Pure child-policy hint logic (no i18n/React) so it can be unit-tested.
// Given a voucher category and the children's ages, returns advisory hint
// keys + counts. The UI translates `childPolicy.<key>` with { count }.
// These are typical hotel conventions (mock) — always "guide only".
export function childPolicyHints(category, ages = []) {
  const a = (ages || []).map(Number).filter((n) => !Number.isNaN(n))
  const count = (pred) => a.filter(pred).length
  const hints = []

  const diningLike = category === 'dining' || category === 'discount' || category === 'gift'
  if (diningLike) {
    const free = count((x) => x < 6)
    const half = count((x) => x >= 6 && x <= 12)
    if (free) hints.push({ key: 'diningFree', count: free })
    if (half) hints.push({ key: 'diningHalf', count: half })
  } else if (category === 'room') {
    const free = count((x) => x < 12)
    const extra = count((x) => x >= 12)
    if (free) hints.push({ key: 'roomFree', count: free })
    if (extra) hints.push({ key: 'roomExtra', count: extra })
  } else if (category === 'spa') {
    const restricted = count((x) => x < 16)
    if (restricted) hints.push({ key: 'spaRestricted', count: restricted })
  }

  return hints
}
