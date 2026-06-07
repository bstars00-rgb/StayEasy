// Thin HTTP client for the StayEasy backend (to be built separately, see
// docs/api/openapi.yaml + AGENTS.md). The app currently runs fully on
// localStorage (src/utils/storage.js); this client is the seam that will
// back the same operations with the real API once VITE_USE_API is enabled.
//
// Base URL comes from VITE_API_BASE_URL (see .env.example).

const BASE = import.meta.env.VITE_API_BASE_URL || ''

// Pure URL builder (unit-tested): joins base + path and appends a query.
export function buildUrl(base, path, query) {
  const b = (base || '').replace(/\/+$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  let url = `${b}${p}`
  if (query) {
    const qs = Object.entries(query)
      .filter(([, v]) => v != null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')
    if (qs) url += `?${qs}`
  }
  return url
}

// Bearer token is stored alongside the auth profile (set by /auth/google).
function authHeaders() {
  try {
    const a = JSON.parse(window.localStorage.getItem('stayeasy.auth') || 'null')
    return a && a.token ? { Authorization: `Bearer ${a.token}` } : {}
  } catch {
    return {}
  }
}

export async function request(method, path, { query, body } = {}) {
  const res = await fetch(buildUrl(BASE, path, query), {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: body != null ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    let detail
    try {
      detail = await res.json()
    } catch {
      /* no body */
    }
    const err = new Error(`HTTP ${res.status}`)
    err.status = res.status
    err.detail = detail
    throw err
  }
  if (res.status === 204) return null
  return res.json()
}

export const http = {
  get: (path, opts) => request('GET', path, opts),
  post: (path, body, opts) => request('POST', path, { ...opts, body }),
  patch: (path, body, opts) => request('PATCH', path, { ...opts, body }),
  del: (path, opts) => request('DELETE', path, opts),
}
