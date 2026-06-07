import { client } from './client.js'

export const reservationsApi = {
  list: () => client.get('/reservations'),
  create: (payload) => client.post('/reservations', payload),
  // status: requested | confirmed | completed | cancelled
  setStatus: (id, status) => client.patch(`/reservations/${id}/status`, { status }),
  remove: (id) => client.del(`/reservations/${id}`),
}
