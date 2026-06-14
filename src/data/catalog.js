// Catalog hydration: in API mode, replace the static catalog (memberships,
// sales pricing, voucher packs) with the backend's DB-backed catalog IN PLACE,
// so every existing synchronous reader (getMembership/getVoucherPack/getPricing)
// transparently serves admin-managed data. Static data is the instant first
// paint + the offline fallback. Availability live-sync is a later phase.
import { api, USE_API } from '../api/index.js'
import { memberships, sales } from './memberships.js'
import { voucherPacks } from './voucherPacks.js'

const arr = (x) => (Array.isArray(x) ? x : x?.items || x?.data || [])

let done = false

export async function syncCatalog() {
  if (!USE_API || done) return false
  try {
    const list = arr(await api.catalog.memberships())
    if (!list.length) return false

    // Memberships (keep the array reference so existing imports update).
    memberships.splice(0, memberships.length, ...list)

    // Pricing map used by getPricing(): rebuild from inline salePrice/commission.
    Object.keys(sales).forEach((k) => delete sales[k])
    list.forEach((m) => {
      if (m.salePrice != null || m.commissionRate != null) {
        sales[m.id] = { salePrice: m.salePrice ?? null, commissionRate: m.commissionRate ?? 0 }
      }
    })

    // Voucher packs per membership (membership detail includes its vouchers).
    const details = await Promise.all(list.map((m) => api.catalog.membership(m.id).catch(() => null)))
    details.forEach((d) => {
      if (d && d.id) voucherPacks[d.id] = arr(d.vouchers)
    })

    done = true
    return true
  } catch {
    return false // keep static data on any failure
  }
}
