import { client } from './client.js'

export const walletApi = {
  get: () => client.get('/wallet'),
  addMembership: (membershipId, source = 'free_join') =>
    client.post('/wallet/memberships', { membershipId, source }),
  removeMembership: (membershipId) => client.del(`/wallet/memberships/${membershipId}`),
  // params: { category, membershipId }
  vouchers: (params) => client.get('/wallet/vouchers', { query: params }),
}
