import { client } from './client.js'

export const catalogApi = {
  cities: () => client.get('/cities'),
  // params: { city, benefit, sort }
  memberships: (params) => client.get('/memberships', { query: params }),
  membership: (id) => client.get(`/memberships/${id}`),
  compare: (ids) => client.get('/memberships/compare', { query: { ids: (ids || []).join(',') } }),
  // Public booking-availability rule for a voucher (admin-editable, server-authoritative).
  availability: (templateId) => client.get(`/vouchers/${templateId}/availability`),
}
