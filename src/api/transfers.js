import { client } from './client.js'

export const transfersApi = {
  list: () => client.get('/transfers'),
  create: (payload) => client.post('/transfers', payload),
}
