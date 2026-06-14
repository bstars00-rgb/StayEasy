import { client } from './client.js'

// Admin / back-office API. All routes under /admin/* require an admin (or, for
// reads, operator) account; non-authorized → 403 ADMIN_REQUIRED.
export const adminApi = {
  // Overview
  dashboard: () => client.get('/admin/dashboard'),
  auditLogs: () => client.get('/admin/audit-logs'),

  // Orders / reservations / assistance
  listOrders: () => client.get('/admin/orders'),
  setOrderStatus: (id, status) => client.patch(`/admin/orders/${id}/status`, { status }),
  listReservations: () => client.get('/admin/reservations'),
  setReservationStatus: (id, status) => client.patch(`/admin/reservations/${id}/status`, { status }),
  listAssistance: () => client.get('/admin/assistance-requests'),
  updateAssistance: (id, patch) => client.patch(`/admin/assistance-requests/${id}`, patch),

  // Catalog
  listMemberships: () => client.get('/admin/memberships'),
  createMembership: (body) => client.post('/admin/memberships', body),
  updateMembership: (id, patch) => client.patch(`/admin/memberships/${id}`, patch),
  deleteMembership: (id) => client.del(`/admin/memberships/${id}`),
  membershipVouchers: (id) => client.get(`/admin/memberships/${id}/vouchers`),
  createVoucher: (membershipId, body) => client.post(`/admin/memberships/${membershipId}/vouchers`, body),
  updateVoucher: (templateId, patch) => client.patch(`/admin/vouchers/${templateId}`, patch),
  deleteVoucher: (templateId) => client.del(`/admin/vouchers/${templateId}`),

  // Availability + holidays
  getAvailability: (templateId) => client.get(`/admin/vouchers/${templateId}/availability`),
  setAvailability: (templateId, rule) => client.put(`/admin/vouchers/${templateId}/availability`, rule),
  listHolidays: () => client.get('/admin/holidays'),
  createHoliday: (body) => client.post('/admin/holidays', body),
  updateHoliday: (id, patch) => client.patch(`/admin/holidays/${id}`, patch),
  deleteHoliday: (id) => client.del(`/admin/holidays/${id}`),

  // Members
  listUsers: () => client.get('/admin/users'),
  getUser: (id) => client.get(`/admin/users/${id}`),

  // Settlement
  settlement: () => client.get('/admin/settlements/summary'),
}

// Lists come back as { items, meta } (paginated) or a bare array; normalize.
export const itemsOf = (res) => (Array.isArray(res) ? res : res?.items || res?.data || [])

// Download an admin CSV report (auth header can't ride on a plain <a>, so fetch
// the blob with the bearer token and trigger a client-side download).
export async function downloadCsv(path, filename) {
  const base = import.meta.env.VITE_API_BASE_URL || ''
  const prefix = import.meta.env.VITE_API_PREFIX ?? '/api/v1'
  let tok = null
  try {
    const a = JSON.parse(window.localStorage.getItem('stayeasy.auth') || 'null')
    tok = a && (a.accessToken || a.token)
  } catch {
    /* ignore */
  }
  const res = await fetch(`${base}${prefix}${path}`, { headers: tok ? { Authorization: `Bearer ${tok}` } : {} })
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
