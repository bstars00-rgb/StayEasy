// Typed-ish resource client mirroring docs/api/openapi.yaml 1:1.
// Each function maps to one endpoint the backend (Codex) implements.
// The frontend will route through these once VITE_USE_API is on; until then
// the app uses src/utils/storage.js (local). Keep this file in sync with the
// OpenAPI contract — it is the frontend's view of that contract.

import { http } from './httpClient.js'

export const api = {
  auth: {
    // Exchange a Google ID token (credential) for a session token + profile.
    google: (credential) => http.post('/auth/google', { credential }),
    me: () => http.get('/auth/me'),
    logout: () => http.post('/auth/logout'),
  },

  memberships: {
    list: (params) => http.get('/memberships', { query: params }), // ?city=&benefit=
    get: (id) => http.get(`/memberships/${id}`),
    vouchers: (id) => http.get(`/memberships/${id}/vouchers`),
  },

  // The signed-in member's data.
  wallet: {
    // Owned memberships + their vouchers with computed availability stats.
    get: () => http.get('/me/wallet'),
    addMembership: (membershipId) => http.post('/me/memberships', { membershipId }),
    removeMembership: (membershipId) => http.del(`/me/memberships/${membershipId}`),
  },

  reservations: {
    list: () => http.get('/me/reservations'),
    create: (payload) => http.post('/me/reservations', payload),
    setStatus: (id, status) => http.patch(`/me/reservations/${id}`, { status }),
    remove: (id) => http.del(`/me/reservations/${id}`),
  },

  transfers: {
    list: () => http.get('/me/transfers'),
    create: (payload) => http.post('/me/transfers', payload),
  },

  orders: {
    list: () => http.get('/me/orders'),
    create: (payload) => http.post('/me/orders', payload),
    setStatus: (id, status) => http.patch(`/me/orders/${id}`, { status }),
  },

  partner: {
    settlement: () => http.get('/partner/settlement'),
  },

  assistance: {
    create: (payload) => http.post('/assistance', payload),
  },
}

// Whether the app should use the remote API instead of local storage.
export const USE_API = String(import.meta.env.VITE_USE_API) === 'true'
