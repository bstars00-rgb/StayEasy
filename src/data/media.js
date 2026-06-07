// Centralized image sources (hybrid model).
//
// Photos use LoremFlickr — topical, keyword-based stock photos that need no
// API key. They are representative (not the exact property). If a URL is empty
// or fails to load, <SmartImage> falls back to a themed gradient + icon, so
// the UI always looks intact (offline / on GitHub Pages too).
//
// To use real photography later, replace the URL builders here (or add a
// `photo` field on a membership/voucher) — no component changes needed.

function hash(str) {
  let h = 0
  for (let i = 0; i < String(str).length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

// LoremFlickr: https://loremflickr.com/<w>/<h>/<keywords>?lock=<n>
const lf = (keywords, lock, w = 640, h = 420) =>
  `https://loremflickr.com/${w}/${h}/${encodeURIComponent(keywords)}?lock=${lock}`

// Voucher categories → keyword, icon, fallback gradient.
export const CATEGORY_MEDIA = {
  dining: { kw: 'restaurant,food', icon: 'utensils', grad: ['#b91c1c', '#f97316'], lock: 21 },
  room: { kw: 'hotel,bedroom', icon: 'bed', grad: ['#0f766e', '#14b8a6'], lock: 22 },
  spa: { kw: 'spa,wellness', icon: 'flower', grad: ['#047857', '#34d399'], lock: 23 },
  discount: { kw: 'restaurant,dinner', icon: 'tag', grad: ['#b45309', '#f59e0b'], lock: 24 },
  gift: { kw: 'cake,dessert', icon: 'gift', grad: ['#9d174d', '#ec4899'], lock: 25 },
  other: { kw: 'hotel,lobby', icon: 'dots', grad: ['#334155', '#64748b'], lock: 26 },
}

export function categoryMeta(category) {
  return CATEGORY_MEDIA[category] || CATEGORY_MEDIA.other
}

export function categoryPhoto(category) {
  const c = categoryMeta(category)
  return lf(c.kw, c.lock)
}

// Voucher photo: explicit override on the template, else its category photo.
export function voucherPhoto(template) {
  if (!template) return ''
  return template.photo || lf(categoryMeta(template.category).kw, categoryMeta(template.category).lock + (hash(template.templateId) % 40))
}

// Membership hero photo (luxury hotel/resort), varied per membership.
export function membershipPhoto(id) {
  return lf('luxury,hotel,resort', 100 + (hash(id) % 80))
}

// Per-hotel thumbnail, varied by name + index.
export function hotelPhoto(name, i = 0) {
  return lf('hotel,architecture,building', 300 + ((hash(name) + i) % 90))
}
