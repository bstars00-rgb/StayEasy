// localStorage helpers for StayEasy. All access is wrapped in try/catch so a
// disabled or full storage (e.g. Safari private mode) never crashes the app.
//
// Stored shapes:
//   memberships -> string[]  (membership ids; deduped)
//   benefits    -> object[]  ({ id, membershipName, title, type, expiry,
//                              value, currency, status, notes })
//   lang        -> string
//   city        -> string

const KEYS = {
  memberships: 'stayeasy.savedMemberships',
  usage: 'stayeasy.voucherUsage',
  reservations: 'stayeasy.reservations',
  orders: 'stayeasy.orders',
  lang: 'stayeasy.lang',
  city: 'stayeasy.city',
}

function readJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw != null ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore write failures */
  }
}

function readString(key, fallback) {
  try {
    return window.localStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}

function writeString(key, value) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    /* ignore */
  }
}

function uniqueId(prefix = 'b') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

/* ----------------------------- Memberships ----------------------------- */

export function getSavedMemberships() {
  const list = readJSON(KEYS.memberships, [])
  return Array.isArray(list) ? list : []
}

// Accepts a membership object or a raw id; stores the id, de-duplicated.
export function saveMembership(membership) {
  const id = typeof membership === 'string' ? membership : membership?.id
  if (!id) return getSavedMemberships()
  const list = getSavedMemberships()
  if (!list.includes(id)) list.push(id)
  writeJSON(KEYS.memberships, list)
  return list
}

export function removeMembership(membershipId) {
  const list = getSavedMemberships().filter((id) => id !== membershipId)
  writeJSON(KEYS.memberships, list)
  return list
}

// Purge operational data tied to a membership when it leaves the wallet:
// its voucher usage counters and any of its reservations. Orders are NOT
// touched (they remain as historical purchase/commission records).
export function removeMembershipArtifacts(membershipId) {
  const usage = getVoucherUsage()
  Object.keys(usage).forEach((k) => {
    if (k.startsWith(`${membershipId}:`)) delete usage[k]
  })
  writeJSON(KEYS.usage, usage)

  const reservations = getReservations().filter((r) => r.membershipId !== membershipId)
  writeJSON(KEYS.reservations, reservations)

  return { usage, reservations }
}

/* --------------------------- Voucher usage ----------------------------- */
// Map of `${membershipId}:${templateId}` -> number of vouchers consumed.

export function getVoucherUsage() {
  const u = readJSON(KEYS.usage, {})
  return u && typeof u === 'object' ? u : {}
}

export function setVoucherUsedCount(membershipId, templateId, count) {
  const usage = getVoucherUsage()
  usage[`${membershipId}:${templateId}`] = Math.max(0, count)
  writeJSON(KEYS.usage, usage)
  return usage
}

/* ----------------------------- Reservations ---------------------------- */
// Each: { id, membershipId, templateId, title, date, guests, hotel, note,
//         status: 'requested'|'confirmed'|'completed'|'cancelled', createdAt }

export function getReservations() {
  const list = readJSON(KEYS.reservations, [])
  return Array.isArray(list) ? list : []
}

export function addReservation(reservation) {
  const list = getReservations()
  const entry = {
    id: uniqueId('r'),
    status: 'requested',
    createdAt: new Date().toISOString(),
    ...reservation,
  }
  list.unshift(entry)
  writeJSON(KEYS.reservations, list)
  return entry
}

export function updateReservation(id, updates) {
  const list = getReservations().map((r) => (r.id === id ? { ...r, ...updates } : r))
  writeJSON(KEYS.reservations, list)
  return list
}

export function removeReservation(id) {
  const list = getReservations().filter((r) => r.id !== id)
  writeJSON(KEYS.reservations, list)
  return list
}

/* ------------------------------- Orders -------------------------------- */
// Each: { id, membershipId, buyerName, buyerEmail, buyerPhone, city,
//         listPrice, salePrice, paidAmount, currency, commissionRate,
//         commissionAmount, status, createdAt }
// status: 'requested'|'invoiced'|'paid'|'activated'|'cancelled'
// Payment happens at the hotel brand; StayEasy only records the order and
// the commission it will earn on the paid amount.

export function getOrders() {
  const list = readJSON(KEYS.orders, [])
  return Array.isArray(list) ? list : []
}

export function addOrder(order) {
  const list = getOrders()
  const entry = { id: uniqueId('o'), status: 'requested', createdAt: new Date().toISOString(), ...order }
  list.unshift(entry)
  writeJSON(KEYS.orders, list)
  return entry
}

export function updateOrder(id, updates) {
  const list = getOrders().map((o) => (o.id === id ? { ...o, ...updates } : o))
  writeJSON(KEYS.orders, list)
  return list
}

export function removeOrder(id) {
  const list = getOrders().filter((o) => o.id !== id)
  writeJSON(KEYS.orders, list)
  return list
}

/* ----------------------------- Preferences ----------------------------- */

export function getSelectedLanguage() {
  return readString(KEYS.lang, null)
}

export function setSelectedLanguage(lang) {
  writeString(KEYS.lang, lang)
}

export function getSelectedCity() {
  return readString(KEYS.city, null)
}

export function setSelectedCity(city) {
  writeString(KEYS.city, city)
}
