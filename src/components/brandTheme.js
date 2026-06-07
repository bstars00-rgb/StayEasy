// Brand → gradient accent mapping, kept out of the data file so membership
// records stay focused on facts. Falls back to the OhmySelect teal.
const ACCENTS = {
  Marriott: ['#9a1b1b', '#d23c3c'],
  Accor: ['#1d4ed8', '#3b82f6'],
  Hilton: ['#0f766e', '#14b8a6'],
  IHG: ['#6d28d9', '#a855f7'],
  'Shangri-La': ['#b45309', '#f59e0b'],
  Nikko: ['#be123c', '#fb7185'],
  Hyatt: ['#0369a1', '#0ea5e9'],
  Lotte: ['#a16207', '#eab308'],
}

const DEFAULT_ACCENT = ['#1b3a5b', '#0f2238']

export function accentFor(brand) {
  return ACCENTS[brand] || DEFAULT_ACCENT
}

export function gradient(brand) {
  const [from, to] = accentFor(brand)
  return `linear-gradient(135deg, ${from}, ${to})`
}
