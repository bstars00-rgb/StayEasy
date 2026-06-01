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
  benefits: 'stayeasy.benefits',
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

/* ------------------------------- Benefits ------------------------------- */

export function getSavedBenefits() {
  const list = readJSON(KEYS.benefits, [])
  return Array.isArray(list) ? list : []
}

// Adds a benefit with a generated unique id and default status.
export function saveBenefit(benefit) {
  const list = getSavedBenefits()
  const entry = { id: uniqueId(), status: 'unused', ...benefit }
  if (!entry.id) entry.id = uniqueId()
  list.push(entry)
  writeJSON(KEYS.benefits, list)
  return entry
}

export function updateBenefit(benefitId, updates) {
  const list = getSavedBenefits().map((b) => (b.id === benefitId ? { ...b, ...updates } : b))
  writeJSON(KEYS.benefits, list)
  return list
}

export function removeBenefit(benefitId) {
  const list = getSavedBenefits().filter((b) => b.id !== benefitId)
  writeJSON(KEYS.benefits, list)
  return list
}

export function markBenefitAsUsed(benefitId) {
  return updateBenefit(benefitId, { status: 'used' })
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
