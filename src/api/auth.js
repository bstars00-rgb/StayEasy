import { client } from './client.js'

// POST /auth/google { idToken } -> { accessToken, refreshToken, user }
export const authApi = {
  google: (idToken) => client.post('/auth/google', { idToken }),
  me: () => client.get('/me'),
  logout: () => client.post('/auth/logout'),
}
