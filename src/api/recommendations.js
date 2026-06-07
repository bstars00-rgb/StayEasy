import { client } from './client.js'

export const recommendationsApi = {
  // payload: { city, benefits[], frequency, companions, budget }
  quiz: (payload) => client.post('/recommendations/quiz', payload),
}
