// HTTP client for the StayEasy backend (built by Codex).
// Contract: docs/BACKEND_API_SPEC.md  (prefix /api/v1, { data, meta, error } envelope,
// Bearer accessToken). The app stays on localStorage until VITE_API_BASE_URL is set.

const BASE = import.meta.env.VITE_API_BASE_URL || ''
// Path prefix. Spec uses /api/v1; the current backend prototype serves at root.
// Override with VITE_API_PREFIX="" to target the prototype. (?? keeps "" valid.)
const PREFIX = import.meta.env.VITE_API_PREFIX ?? '/api/v1'

// API mode is on when a backend base URL is configured (per the integration guide).
export const USE_API = !!BASE

// Pure URL builder (unit-tested): base + path + query string.
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

function accessToken() {
  try {
    const a = JSON.parse(window.localStorage.getItem('stayeasy.auth') || 'null')
    return (a && (a.accessToken || a.token)) || null
  } catch {
    return null
  }
}

// Sends a request, unwraps the { data, error } envelope, throws on error
// with the server error `code` attached (see BACKEND_API_SPEC error codes).
export async function apiRequest(method, path, { query, body } = {}) {
  const tok = accessToken()
  const res = await fetch(buildUrl(BASE + PREFIX, path, query), {
    method,
    headers: { 'Content-Type': 'application/json', ...(tok ? { Authorization: `Bearer ${tok}` } : {}) },
    body: body != null ? JSON.stringify(body) : undefined,
  })
  let payload = null
  try {
    payload = await res.json()
  } catch {
    /* empty body */
  }
  if (!res.ok) {
    // Error can be enveloped ({error:{code,message}}) or bare ({code,message}).
    const e = (payload && payload.error) || payload || {}
    const err = new Error(e.message || `HTTP ${res.status}`)
    err.status = res.status
    err.code = e.code
    err.details = e.details
    throw err
  }
  // Success: tolerate both the spec envelope and bare responses (prototype).
  if (payload && typeof payload === 'object' && !Array.isArray(payload) && 'data' in payload && 'error' in payload) {
    if (payload.error) {
      const err = new Error(payload.error.message || 'API error')
      err.code = payload.error.code
      err.details = payload.error.details
      throw err
    }
    return payload.data
  }
  return payload
}

export const client = {
  get: (path, opts) => apiRequest('GET', path, opts),
  post: (path, body, opts) => apiRequest('POST', path, { ...opts, body }),
  patch: (path, body, opts) => apiRequest('PATCH', path, { ...opts, body }),
  del: (path, opts) => apiRequest('DELETE', path, opts),
}
