import { client } from './client.js'

export const ordersApi = {
  list: () => client.get('/orders'),
  create: (payload) => client.post('/orders', payload),
  // status: requested | invoiced | paid | activated | cancelled (operator/partner)
  setStatus: (id, status) => client.patch(`/orders/${id}/status`, { status }),
  settlementSummary: () => client.get('/settlements/summary'),
}
