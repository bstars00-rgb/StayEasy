import { client } from './client.js'

export const assistanceApi = {
  create: (payload) => client.post('/assistance-requests', payload),
}
