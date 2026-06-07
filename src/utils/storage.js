// localStorage helpers for StayEasy. All access is wrapped in try/catch so a
// disabled or full storage (e.g. Safari private mode) never crashes the app.
//
// Stored shapes:
//   memberships -> string[]  (membership ids; deduped)
//   benefits    -> object[]  ({ id, membershipName, title, type, expiry,
//                              value, currency, status, notes })
//   lang        -> string
//   city        -> string

// Global (not per-account) keys.
const KEYS = {
  auth: 'stayeasy.auth',
  lang: 'stayeasy.lang',
  city: 'stayeasy.city',
}

// Per-account data is namespaced by scope. The guest scope keeps the legacy
// unprefixed keys (backward compatible); a signed-in user gets a prefix so
// each account has its own wallet/orders/etc.
let SCOPE = 'guest'

export function scopeForUser(user) {
  return user && user.id ? `u_${user.id}` : 'guest'
}

export function setScope(scope) {
  SCOPE = scope || 'guest'
}

export function initScopeFromAuth() {
  setScope(scopeForUser(getAuthUser()))
}

// Scoped key: guest → "stayeasy.<base>", user → "stayeasy.<scope>.<base>".
function k(base) {
  return SCOPE === 'guest' ? `stayeasy.${base}` : `stayeasy.${SCOPE}.${base}`
}

const DEFAULT_COMPARE = ['club-marriott-vietnam', 'accor-plus-vietnam']

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
  const list = readJSON(k('savedMemberships'), [])
  return Array.isArray(list) ? list : []
}

// Accepts a membership object or a raw id; stores the id, de-duplicated.
export function saveMembership(membership) {
  const id = typeof membership === 'string' ? membership : membership?.id
  if (!id) return getSavedMemberships()
  const list = getSavedMemberships()
  if (!list.includes(id)) list.push(id)
  writeJSON(k('savedMemberships'), list)
  return list
}

export function removeMembership(membershipId) {
  const list = getSavedMemberships().filter((id) => id !== membershipId)
  writeJSON(k('savedMemberships'), list)
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
  writeJSON(k('voucherUsage'), usage)

  const reservations = getReservations().filter((r) => r.membershipId !== membershipId)
  writeJSON(k('reservations'), reservations)

  const transfers = getTransfers().filter((x) => x.membershipId !== membershipId)
  writeJSON(k('transfers'), transfers)

  return { usage, reservations, transfers }
}

/* --------------------------- Voucher usage ----------------------------- */
// Map of `${membershipId}:${templateId}` -> number of vouchers consumed.

export function getVoucherUsage() {
  const u = readJSON(k('voucherUsage'), {})
  return u && typeof u === 'object' ? u : {}
}

export function setVoucherUsedCount(membershipId, templateId, count) {
  const usage = getVoucherUsage()
  usage[`${membershipId}:${templateId}`] = Math.max(0, count)
  writeJSON(k('voucherUsage'), usage)
  return usage
}

/* ----------------------------- Reservations ---------------------------- */
// Each: { id, membershipId, templateId, title, date, guests, hotel, note,
//         status: 'requested'|'confirmed'|'completed'|'cancelled', createdAt }

export function getReservations() {
  const list = readJSON(k('reservations'), [])
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
  writeJSON(k('reservations'), list)
  return entry
}

export function updateReservation(id, updates) {
  const list = getReservations().map((r) => (r.id === id ? { ...r, ...updates } : r))
  writeJSON(k('reservations'), list)
  return list
}

export function removeReservation(id) {
  const list = getReservations().filter((r) => r.id !== id)
  writeJSON(k('reservations'), list)
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
  const list = readJSON(k('orders'), [])
  return Array.isArray(list) ? list : []
}

export function addOrder(order) {
  const list = getOrders()
  const entry = { id: uniqueId('o'), status: 'requested', createdAt: new Date().toISOString(), ...order }
  list.unshift(entry)
  writeJSON(k('orders'), list)
  return entry
}

export function updateOrder(id, updates) {
  const list = getOrders().map((o) => (o.id === id ? { ...o, ...updates } : o))
  writeJSON(k('orders'), list)
  return list
}

export function removeOrder(id) {
  const list = getOrders().filter((o) => o.id !== id)
  writeJSON(k('orders'), list)
  return list
}

/* ------------------------------ Transfers ------------------------------ */
// Voucher gifts. Each: { id, membershipId, templateId, title, recipientName,
//   recipientContact, message, createdAt }. Each transfer consumes one unit
// of the voucher's availability.

export function getTransfers() {
  const list = readJSON(k('transfers'), [])
  return Array.isArray(list) ? list : []
}

export function addTransfer(transfer) {
  const list = getTransfers()
  const entry = { id: uniqueId('g'), createdAt: new Date().toISOString(), ...transfer }
  list.unshift(entry)
  writeJSON(k('transfers'), list)
  return entry
}

/* ------------------------------- Compare ------------------------------- */
// Membership ids selected for side-by-side comparison (max enforced in UI).

export function getCompare() {
  const list = readJSON(k('compare'), null)
  return Array.isArray(list) ? list : DEFAULT_COMPARE
}

export function setCompare(ids) {
  writeJSON(k('compare'), ids)
  return ids
}

/* -------------------------------- Auth --------------------------------- */
// { id, provider, name, email, picture, signedInAt }

export function getAuthUser() {
  return readJSON(KEYS.auth, null)
}

export function setAuthUser(user) {
  writeJSON(KEYS.auth, user)
  return user
}

export function clearAuthUser() {
  try {
    window.localStorage.removeItem(KEYS.auth)
  } catch {
    /* ignore */
  }
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
