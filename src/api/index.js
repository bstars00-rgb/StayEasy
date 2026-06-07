// Aggregated OhmySelect API client. Mirrors docs/BACKEND_API_SPEC.md.
// Usage (once VITE_API_BASE_URL is set): import { api, USE_API } from './api'
export { client, USE_API, buildUrl } from './client.js'
import { authApi } from './auth.js'
import { catalogApi } from './catalog.js'
import { walletApi } from './wallet.js'
import { reservationsApi } from './reservations.js'
import { ordersApi } from './orders.js'
import { transfersApi } from './transfers.js'
import { assistanceApi } from './assistance.js'
import { recommendationsApi } from './recommendations.js'

export const api = {
  auth: authApi,
  catalog: catalogApi,
  wallet: walletApi,
  reservations: reservationsApi,
  orders: ordersApi,
  transfers: transfersApi,
  assistance: assistanceApi,
  recommendations: recommendationsApi,
}
