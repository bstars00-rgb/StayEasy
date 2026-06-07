import http from 'node:http'
import { randomUUID } from 'node:crypto'
import { URL } from 'node:url'
import { memberships, getMembership, getPricing } from '../src/data/memberships.js'
import { cities } from '../src/data/cities.js'
import { getVoucherPack, getVoucherTemplate } from '../src/data/voucherPacks.js'
import { voucherStats, OPEN_RESERVATION_STATUSES } from '../src/utils/vouchers.js'

const PORT = Number(process.env.PORT || 8787)

const usersByToken = new Map()
const usersByEmail = new Map()
const stateByUser = new Map()
const assistanceRequests = []

function now() {
  return new Date().toISOString()
}

function makeId(prefix) {
  return `${prefix}_${randomUUID().slice(0, 8)}`
}

function json(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  })
  res.end(JSON.stringify(payload))
}

function noContent(res) {
  res.writeHead(204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  })
  res.end()
}

function error(res, status, code, message, details = {}) {
  json(res, status, { code, message, details })
}

async function readBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  if (!chunks.length) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    return {}
  }
}

function currentUser(req) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  return usersByToken.get(token) || null
}

function requireUser(req, res) {
  const user = currentUser(req)
  if (!user) {
    error(res, 401, 'AUTH_REQUIRED', 'Sign in is required.')
    return null
  }
  return user
}

function userState(userId) {
  if (!stateByUser.has(userId)) {
    stateByUser.set(userId, {
      savedMemberships: [],
      usage: {},
      reservations: [],
      orders: [],
      transfers: [],
    })
  }
  return stateByUser.get(userId)
}

function publicMembership(membership) {
  const pricing = getPricing(membership)
  return {
    ...membership,
    salePrice: pricing?.salePrice ?? null,
    paidAmount: pricing?.paidAmount ?? membership.annualFee,
    commissionRate: pricing?.commissionRate ?? 0,
    commissionAmount: pricing?.commissionAmount ?? 0,
  }
}

function filterMemberships(params) {
  let list = memberships
  const city = params.get('city')
  const benefit = params.get('benefit')
  if (city) list = list.filter((m) => m.cities.includes(city))
  if (benefit) {
    list = list.filter((m) => {
      if (m.bestFor.includes(benefit)) return true
      if (benefit === 'dining') return m.diningDiscount != null
      if (benefit === 'room') return m.roomDiscount != null || m.freeNight
      if (benefit === 'spa') return m.spaBenefit
      if (benefit === 'freeNight') return m.freeNight
      return getVoucherPack(m.id).some((v) => v.category === benefit)
    })
  }
  return list.map(publicMembership).sort((a, b) => b.scores.overall - a.scores.overall)
}

function usageKey(membershipId, templateId) {
  return `${membershipId}:${templateId}`
}

function countOpenReservations(state, membershipId, templateId) {
  return state.reservations.filter(
    (r) =>
      r.membershipId === membershipId &&
      r.templateId === templateId &&
      OPEN_RESERVATION_STATUSES.includes(r.status)
  ).length
}

function countTransfers(state, membershipId, templateId) {
  return state.transfers.filter((t) => t.membershipId === membershipId && t.templateId === templateId).length
}

function voucherView(state, membershipId, template) {
  const used = state.usage[usageKey(membershipId, template.templateId)] || 0
  const held = countOpenReservations(state, membershipId, template.templateId)
  const transferred = countTransfers(state, membershipId, template.templateId)
  return {
    membershipId,
    ...template,
    ...voucherStats(template.quantity, used, held, transferred),
  }
}

function walletFor(user) {
  const state = userState(user.id)
  const owned = state.savedMemberships.map(getMembership).filter(Boolean).map(publicMembership)
  const vouchers = state.savedMemberships.flatMap((membershipId) =>
    getVoucherPack(membershipId).map((template) => voucherView(state, membershipId, template))
  )
  return {
    summary: {
      membershipCount: owned.length,
      availableVoucherCount: vouchers.reduce((sum, v) => sum + v.available, 0),
      expiringSoonCount: vouchers.filter((v) => v.available > 0 && daysUntil(v.validUntil) <= 30).length,
      openReservationCount: state.reservations.filter((r) => OPEN_RESERVATION_STATUSES.includes(r.status)).length,
    },
    memberships: owned,
    vouchers,
    reservations: state.reservations,
    orders: state.orders,
    transfers: state.transfers,
  }
}

function daysUntil(date) {
  const target = new Date(`${date}T00:00:00Z`).getTime()
  return Math.ceil((target - Date.now()) / 86400000)
}

function ensureOwned(state, membershipId) {
  return state.savedMemberships.includes(membershipId)
}

function addMembership(state, membershipId) {
  if (!getMembership(membershipId)) return false
  if (!state.savedMemberships.includes(membershipId)) state.savedMemberships.unshift(membershipId)
  return true
}

function availableVoucher(state, membershipId, templateId) {
  const template = getVoucherTemplate(membershipId, templateId)
  if (!template) return null
  return voucherView(state, membershipId, template)
}

function createUserFromCredential(credential) {
  const suffix = String(credential || '').slice(-8) || 'demo'
  const email = `demo-${suffix}@stayeasy.local`
  const existing = usersByEmail.get(email)
  if (existing) return existing
  const user = {
    id: makeId('usr'),
    provider: 'google',
    name: 'StayEasy Demo User',
    email,
    picture: '',
    createdAt: now(),
  }
  usersByEmail.set(email, user)
  return user
}

async function route(req, res) {
  if (req.method === 'OPTIONS') return noContent(res)

  const url = new URL(req.url, `http://${req.headers.host}`)
  const rawPath = url.pathname.replace(/\/+$/, '') || '/'
  const path = rawPath.startsWith('/api/v1') ? rawPath.slice('/api/v1'.length) || '/' : rawPath
  const body = ['POST', 'PATCH', 'PUT'].includes(req.method) ? await readBody(req) : {}

  if (req.method === 'GET' && path === '/health') {
    return json(res, 200, { ok: true, service: 'stayeasy-backend-prototype', time: now() })
  }

  if (req.method === 'GET' && path === '/cities') return json(res, 200, cities)

  if (req.method === 'POST' && path === '/auth/google') {
    const user = createUserFromCredential(body.credential || body.idToken)
    const token = `demo_${randomUUID()}`
    usersByToken.set(token, user)
    return json(res, 200, { accessToken: token, refreshToken: token, token, user })
  }

  if (req.method === 'GET' && (path === '/auth/me' || path === '/me')) {
    const user = requireUser(req, res)
    if (!user) return
    return json(res, 200, user)
  }

  if (req.method === 'POST' && path === '/auth/logout') return noContent(res)

  if (req.method === 'GET' && path === '/memberships') {
    return json(res, 200, filterMemberships(url.searchParams))
  }

  if (req.method === 'GET' && path === '/memberships/compare') {
    const ids = (url.searchParams.get('ids') || '').split(',').filter(Boolean).slice(0, 3)
    return json(res, 200, ids.map(getMembership).filter(Boolean).map(publicMembership))
  }

  const membershipVoucherMatch = path.match(/^\/memberships\/([^/]+)\/vouchers$/)
  if (req.method === 'GET' && membershipVoucherMatch) {
    return json(res, 200, getVoucherPack(membershipVoucherMatch[1]))
  }

  const membershipMatch = path.match(/^\/memberships\/([^/]+)$/)
  if (req.method === 'GET' && membershipMatch) {
    const membership = getMembership(membershipMatch[1])
    if (!membership) return error(res, 404, 'MEMBERSHIP_NOT_FOUND', 'Membership was not found.')
    return json(res, 200, { ...publicMembership(membership), vouchers: getVoucherPack(membership.id) })
  }

  if (req.method === 'GET' && (path === '/me/wallet' || path === '/wallet')) {
    const user = requireUser(req, res)
    if (!user) return
    return json(res, 200, walletFor(user))
  }

  if (req.method === 'POST' && (path === '/me/memberships' || path === '/wallet/memberships')) {
    const user = requireUser(req, res)
    if (!user) return
    const state = userState(user.id)
    if (!addMembership(state, body.membershipId)) {
      return error(res, 404, 'MEMBERSHIP_NOT_FOUND', 'Membership was not found.')
    }
    return json(res, 201, walletFor(user))
  }

  const ownedMembershipMatch =
    path.match(/^\/me\/memberships\/([^/]+)$/) || path.match(/^\/wallet\/memberships\/([^/]+)$/)
  if (req.method === 'DELETE' && ownedMembershipMatch) {
    const user = requireUser(req, res)
    if (!user) return
    const state = userState(user.id)
    const membershipId = ownedMembershipMatch[1]
    state.savedMemberships = state.savedMemberships.filter((id) => id !== membershipId)
    Object.keys(state.usage).forEach((key) => {
      if (key.startsWith(`${membershipId}:`)) delete state.usage[key]
    })
    state.reservations = state.reservations.filter((r) => r.membershipId !== membershipId)
    state.transfers = state.transfers.filter((t) => t.membershipId !== membershipId)
    return noContent(res)
  }

  if (req.method === 'GET' && path === '/wallet/vouchers') {
    const user = requireUser(req, res)
    if (!user) return
    const wallet = walletFor(user)
    const category = url.searchParams.get('category')
    const membershipId = url.searchParams.get('membershipId')
    let vouchers = wallet.vouchers
    if (membershipId) vouchers = vouchers.filter((v) => v.membershipId === membershipId)
    if (category && category !== 'all') vouchers = vouchers.filter((v) => v.category === category)
    return json(res, 200, vouchers)
  }

  if (req.method === 'GET' && (path === '/me/reservations' || path === '/reservations')) {
    const user = requireUser(req, res)
    if (!user) return
    return json(res, 200, userState(user.id).reservations)
  }

  if (req.method === 'POST' && (path === '/me/reservations' || path === '/reservations')) {
    const user = requireUser(req, res)
    if (!user) return
    const state = userState(user.id)
    if (!ensureOwned(state, body.membershipId)) return error(res, 403, 'FORBIDDEN', 'Membership is not in wallet.')
    const voucher = availableVoucher(state, body.membershipId, body.templateId)
    if (!voucher) return error(res, 404, 'VOUCHER_NOT_FOUND', 'Voucher was not found.')
    if (voucher.available <= 0) return error(res, 409, 'VOUCHER_NOT_AVAILABLE', 'No available voucher remains.')
    const reservation = {
      id: makeId('res'),
      membershipId: body.membershipId,
      templateId: body.templateId,
      title: voucher.title,
      date: body.date,
      adults: Number(body.adults || 1),
      children: Number(body.children || 0),
      childAges: Array.isArray(body.childAges) ? body.childAges : [],
      hotel: body.hotel || '',
      note: body.note || '',
      status: 'requested',
      createdAt: now(),
      updatedAt: now(),
    }
    state.reservations.unshift(reservation)
    return json(res, 201, reservation)
  }

  const reservationMatch =
    path.match(/^\/me\/reservations\/([^/]+)$/) ||
    path.match(/^\/reservations\/([^/]+)$/) ||
    path.match(/^\/reservations\/([^/]+)\/status$/)
  if (reservationMatch) {
    const user = requireUser(req, res)
    if (!user) return
    const state = userState(user.id)
    const id = reservationMatch[1]
    const reservation = state.reservations.find((r) => r.id === id)
    if (!reservation) return error(res, 404, 'RESERVATION_NOT_FOUND', 'Reservation was not found.')

    if (req.method === 'PATCH') {
      const next = body.status
      const valid = {
        requested: ['confirmed', 'cancelled', 'completed'],
        confirmed: ['completed', 'cancelled'],
        completed: [],
        cancelled: [],
      }
      if (!valid[reservation.status]?.includes(next)) {
        return error(res, 409, 'INVALID_STATUS_TRANSITION', 'Reservation status transition is invalid.')
      }
      reservation.status = next
      reservation.updatedAt = now()
      if (next === 'completed') {
        const key = usageKey(reservation.membershipId, reservation.templateId)
        state.usage[key] = (state.usage[key] || 0) + 1
      }
      return json(res, 200, reservation)
    }

    if (req.method === 'DELETE') {
      state.reservations = state.reservations.filter((r) => r.id !== id)
      return noContent(res)
    }
  }

  if (req.method === 'GET' && (path === '/me/orders' || path === '/orders')) {
    const user = requireUser(req, res)
    if (!user) return
    return json(res, 200, userState(user.id).orders)
  }

  if (req.method === 'POST' && (path === '/me/orders' || path === '/orders')) {
    const user = requireUser(req, res)
    if (!user) return
    const membership = getMembership(body.membershipId)
    if (!membership) return error(res, 404, 'MEMBERSHIP_NOT_FOUND', 'Membership was not found.')
    const pricing = getPricing(membership)
    const order = {
      id: makeId('ord'),
      membershipId: membership.id,
      buyerName: body.buyerName || user.name,
      buyerEmail: body.buyerEmail || user.email,
      buyerPhone: body.buyerPhone || '',
      city: body.city || membership.cities[0],
      ...pricing,
      status: 'requested',
      createdAt: now(),
      updatedAt: now(),
    }
    userState(user.id).orders.unshift(order)
    return json(res, 201, order)
  }

  const orderMatch =
    path.match(/^\/me\/orders\/([^/]+)$/) ||
    path.match(/^\/orders\/([^/]+)$/) ||
    path.match(/^\/orders\/([^/]+)\/status$/)
  if (req.method === 'PATCH' && orderMatch) {
    const user = requireUser(req, res)
    if (!user) return
    const state = userState(user.id)
    const order = state.orders.find((o) => o.id === orderMatch[1])
    if (!order) return error(res, 404, 'ORDER_NOT_FOUND', 'Order was not found.')
    const next = body.status
    const valid = {
      requested: ['invoiced', 'cancelled'],
      invoiced: ['paid', 'cancelled'],
      paid: ['activated', 'cancelled'],
      activated: [],
      cancelled: [],
    }
    if (!valid[order.status]?.includes(next)) {
      return error(res, 409, 'INVALID_STATUS_TRANSITION', 'Order status transition is invalid.')
    }
    order.status = next
    order.updatedAt = now()
    if (next === 'activated') addMembership(state, order.membershipId)
    return json(res, 200, order)
  }

  if (req.method === 'GET' && (path === '/me/transfers' || path === '/transfers')) {
    const user = requireUser(req, res)
    if (!user) return
    return json(res, 200, userState(user.id).transfers)
  }

  if (req.method === 'POST' && (path === '/me/transfers' || path === '/transfers')) {
    const user = requireUser(req, res)
    if (!user) return
    const state = userState(user.id)
    const voucher = availableVoucher(state, body.membershipId, body.templateId)
    if (!voucher) return error(res, 404, 'VOUCHER_NOT_FOUND', 'Voucher was not found.')
    if (!voucher.transferable) return error(res, 409, 'VOUCHER_NOT_TRANSFERABLE', 'Voucher is not transferable.')
    if (voucher.available <= 0) return error(res, 409, 'VOUCHER_NOT_AVAILABLE', 'No available voucher remains.')
    const transfer = {
      id: makeId('trn'),
      membershipId: body.membershipId,
      templateId: body.templateId,
      title: voucher.title,
      recipientName: body.recipientName || '',
      recipientContact: body.recipientContact || '',
      message: body.message || '',
      createdAt: now(),
    }
    state.transfers.unshift(transfer)
    return json(res, 201, transfer)
  }

  if (req.method === 'GET' && (path === '/partner/settlement' || path === '/settlements/summary')) {
    const orders = [...stateByUser.values()].flatMap((state) => state.orders)
    const activated = orders.filter((order) => order.status === 'activated')
    return json(res, 200, {
      gmv: activated.reduce((sum, order) => sum + order.paidAmount, 0),
      commission: activated.reduce((sum, order) => sum + order.commissionAmount, 0),
      activatedOrderCount: activated.length,
      currency: 'VND',
    })
  }

  if (req.method === 'POST' && (path === '/assistance' || path === '/assistance-requests')) {
    const entry = { id: makeId('ast'), ...body, status: 'new', createdAt: now() }
    assistanceRequests.unshift(entry)
    return json(res, 201, entry)
  }

  if (req.method === 'POST' && path === '/recommendations/quiz') {
    const city = body.city
    const benefits = Array.isArray(body.benefits) ? body.benefits : []
    const ranked = memberships
      .map((membership) => {
        let score = membership.scores.overall
        if (city && membership.cities.includes(city)) score += 15
        for (const benefit of benefits) {
          if (membership.bestFor.includes(benefit)) score += 10
        }
        if (body.budget === 'free_only' && membership.annualFee > 0) score -= 25
        return {
          membership: publicMembership(membership),
          score,
          reasons: [
            ...(city && membership.cities.includes(city) ? ['city_match'] : []),
            ...benefits.filter((benefit) => membership.bestFor.includes(benefit)).map((benefit) => `benefit_${benefit}`),
          ],
        }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
    return json(res, 200, ranked)
  }

  return error(res, 404, 'NOT_FOUND', 'Endpoint was not found.')
}

const server = http.createServer((req, res) => {
  route(req, res).catch((err) => {
    console.error(err)
    error(res, 500, 'INTERNAL_ERROR', 'Unexpected server error.')
  })
})

server.listen(PORT, () => {
  console.log(`StayEasy backend prototype listening on http://localhost:${PORT}`)
})
