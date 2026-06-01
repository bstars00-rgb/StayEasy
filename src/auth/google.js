// Hybrid Google sign-in helper.
//
// - If VITE_GOOGLE_CLIENT_ID is set, real Google Identity Services (GIS) is
//   used: the official button returns a JWT credential which we decode
//   client-side. (For production, the token should also be verified by a
//   backend — this MVP decodes it for display only.)
// - Otherwise a demo profile is created locally so the flow works with no
//   backend, no external script, and no setup (e.g. on GitHub Pages).

export function getGoogleClientId() {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
}

export function isRealGoogleEnabled() {
  return !!getGoogleClientId()
}

// Decode a base64url string (JWT segment) to UTF-8 text.
function b64urlDecode(segment) {
  const b64 = segment.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(segment.length / 4) * 4, '=')
  const bin = atob(b64)
  // Handle UTF-8 (names with non-ASCII characters).
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

// Parse a Google ID token (JWT) into a StayEasy user profile.
export function parseGoogleCredential(jwt) {
  const parts = String(jwt).split('.')
  if (parts.length < 2) throw new Error('Invalid credential')
  const payload = JSON.parse(b64urlDecode(parts[1]))
  return {
    id: payload.sub,
    provider: 'google',
    name: payload.name || payload.email || 'Google user',
    email: payload.email || '',
    picture: payload.picture || '',
  }
}

// A realistic-looking local profile for demo mode.
export function demoUser() {
  return {
    id: `demo_${Math.random().toString(36).slice(2, 10)}`,
    provider: 'google',
    name: 'Demo User',
    email: 'demo.user@gmail.com',
    picture: '',
    demo: true,
  }
}

// Lazy-load the GIS script (only used when a real client id is configured).
export function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve()
    const existing = document.getElementById('gis-script')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      return
    }
    const s = document.createElement('script')
    s.id = 'gis-script'
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load Google script'))
    document.head.appendChild(s)
  })
}

// Initialize GIS and render the official button into `el`. On success the
// decoded profile is passed to onUser.
export async function renderRealGoogleButton(el, onUser) {
  const clientId = getGoogleClientId()
  if (!clientId || !el) return
  await loadGoogleScript()
  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => {
      try {
        onUser(parseGoogleCredential(response.credential))
      } catch {
        /* ignore malformed credential */
      }
    },
  })
  window.google.accounts.id.renderButton(el, { theme: 'outline', size: 'large', width: 320 })
}
