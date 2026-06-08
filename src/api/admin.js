import { client } from './client.js'

// Admin API (operator console). All routes are under /admin/* and require an
// admin account; non-admins get 403 with code ADMIN_REQUIRED. Mirrors
// backend/server.js admin routes (bare JSON responses).
export const adminApi = {
  listOrders: () => client.get('/admin/orders'),
  setOrderStatus: (id, status) => client.patch(`/admin/orders/${id}/status`, { status }),

  listReservations: () => client.get('/admin/reservations'),
  setReservationStatus: (id, status) => client.patch(`/admin/reservations/${id}/status`, { status }),

  listAssistance: () => client.get('/admin/assistance-requests'),
  updateAssistance: (id, patch) => client.patch(`/admin/assistance-requests/${id}`, patch),

  settlement: () => client.get('/admin/settlements/summary'),
}
