import { createContext, useContext, useState, useCallback, useRef, useMemo, useEffect } from 'react'
import { translate, DEFAULT_LANG } from '../i18n/translations.js'
import { DEFAULT_CITY } from '../data/cities.js'
import { getVoucherTemplate } from '../data/voucherPacks.js'
import { voucherStats, countOpenReservations, countTransfers } from '../utils/vouchers.js'
import { api, USE_API } from '../api/index.js'
import * as storage from '../utils/storage.js'

const MAX_COMPARE = 3

const AppContext = createContext(null)

export function AppProvider({ children }) {
  // Set the storage scope from any persisted login BEFORE reading initial
  // state, so a returning signed-in user loads their own data.
  useState(() => {
    storage.initScopeFromAuth()
    return null
  })

  const [lang, setLangState] = useState(() => storage.getSelectedLanguage() || DEFAULT_LANG)
  const [city, setCityState] = useState(() => storage.getSelectedCity() || DEFAULT_CITY)
  const [savedIds, setSavedIds] = useState(() => storage.getSavedMemberships())
  const [compareIds, setCompareIds] = useState(() => storage.getCompare())
  const [usage, setUsage] = useState(() => storage.getVoucherUsage())
  const [reservations, setReservations] = useState(() => storage.getReservations())
  const [transfers, setTransfers] = useState(() => storage.getTransfers())
  const [orders, setOrders] = useState(() => storage.getOrders())
  // API-mode wallet hydration status (offline mode is always "ready").
  const [walletReady, setWalletReady] = useState(() => !(USE_API && storage.getAuthUser()))
  const [walletError, setWalletError] = useState(false)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  /* ----- i18n + preferences ----- */
  const t = useCallback((key, vars) => translate(lang, key, vars), [lang])

  const setLang = useCallback((next) => {
    storage.setSelectedLanguage(next)
    setLangState(next)
  }, [])

  const setCity = useCallback((next) => {
    storage.setSelectedCity(next)
    setCityState(next)
  }, [])

  /* ----- toast ----- */
  const showToast = useCallback((message) => {
    setToast({ message, id: Date.now() })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2200)
  }, [])

  /* ----- API mode: load everything from the backend wallet ----- */
  // Derives used counts from completed reservations so getVoucherStats works
  // identically in both modes.
  const loadWallet = useCallback(async () => {
    setWalletError(false)
    try {
      const w = await api.wallet.get()
      const ids = (w.memberships || []).map((m) => m.id)
      const res = w.reservations || []
      const u = {}
      res.forEach((r) => {
        if (r.status === 'completed') {
          const k = `${r.membershipId}:${r.templateId}`
          u[k] = (u[k] || 0) + 1
        }
      })
      setSavedIds(ids)
      setReservations(res)
      setTransfers(w.transfers || [])
      setOrders(w.orders || [])
      setUsage(u)
    } catch {
      setWalletError(true) // keep current state; surface a retry in the wallet
    } finally {
      setWalletReady(true)
    }
  }, [])

  // Initial hydrate when a session already exists (API mode only).
  useEffect(() => {
    if (USE_API && storage.getAuthUser()) loadWallet()
  }, [loadWallet])

  /* ----- saved memberships ----- */
  const isSaved = useCallback((id) => savedIds.includes(id), [savedIds])

  const addSaved = useCallback(async (membership) => {
    const id = typeof membership === 'string' ? membership : membership?.id
    if (USE_API) {
      await api.wallet.addMembership(id)
      await loadWallet()
      return
    }
    setSavedIds(storage.saveMembership(membership))
  }, [loadWallet])

  // Removing a membership also purges its orphaned voucher usage and
  // reservations (orders are kept as historical purchase records).
  const removeSaved = useCallback(async (id) => {
    if (USE_API) {
      await api.wallet.removeMembership(id)
      await loadWallet()
      return
    }
    setSavedIds(storage.removeMembership(id))
    const { usage: u, reservations: r, transfers: g } = storage.removeMembershipArtifacts(id)
    setUsage(u)
    setReservations(r)
    setTransfers(g)
  }, [loadWallet])

  const toggleSaved = useCallback(
    (id) => {
      if (savedIds.includes(id)) removeSaved(id)
      else setSavedIds(storage.saveMembership(id))
    },
    [savedIds, removeSaved]
  )

  /* ----- compare ----- */
  const inCompare = useCallback((id) => compareIds.includes(id), [compareIds])

  const toggleCompare = useCallback((id) => {
    setCompareIds((prev) => {
      let next
      if (prev.includes(id)) next = prev.filter((x) => x !== id)
      else if (prev.length >= MAX_COMPARE) next = prev
      else next = [...prev, id]
      storage.setCompare(next)
      return next
    })
  }, [])

  const removeFromCompare = useCallback((id) => {
    setCompareIds((prev) => {
      const next = prev.filter((x) => x !== id)
      storage.setCompare(next)
      return next
    })
  }, [])

  // Switch the active data scope (called by AuthContext on sign in/out) and
  // reload all per-account state from storage for the new scope.
  const reloadForUser = useCallback(
    (user) => {
      if (USE_API) {
        // Server scopes /me data by bearer token; reload (or clear on sign-out).
        if (user) {
          setWalletReady(false)
          setWalletError(false)
          loadWallet()
        } else {
          setSavedIds([])
          setUsage({})
          setReservations([])
          setTransfers([])
          setOrders([])
          setWalletReady(true)
          setWalletError(false)
        }
        return
      }
      storage.setScope(storage.scopeForUser(user))
      setSavedIds(storage.getSavedMemberships())
      setUsage(storage.getVoucherUsage())
      setReservations(storage.getReservations())
      setTransfers(storage.getTransfers())
      setOrders(storage.getOrders())
      setCompareIds(storage.getCompare())
    },
    [loadWallet]
  )

  /* ----- voucher usage ----- */
  const usedCount = useCallback(
    (membershipId, templateId) => usage[`${membershipId}:${templateId}`] || 0,
    [usage]
  )

  // Inventory for a voucher template, accounting for consumed + held + gifted.
  const getVoucherStats = useCallback(
    (membershipId, template) => {
      const used = usage[`${membershipId}:${template.templateId}`] || 0
      const held = countOpenReservations(reservations, membershipId, template.templateId)
      const gifted = countTransfers(transfers, membershipId, template.templateId)
      return voucherStats(template.quantity, used, held, gifted)
    },
    [usage, reservations, transfers]
  )

  // Consume one unit of a voucher (cap at its quantity).
  const consumeVoucher = useCallback((membershipId, templateId) => {
    const tpl = getVoucherTemplate(membershipId, templateId)
    const max = tpl ? tpl.quantity : Infinity
    const current = storage.getVoucherUsage()[`${membershipId}:${templateId}`] || 0
    if (current >= max) return
    setUsage(storage.setVoucherUsedCount(membershipId, templateId, current + 1))
  }, [])

  /* ----- reservations ----- */
  const createReservation = useCallback(
    async (reservation) => {
      if (USE_API) {
        const entry = await api.reservations.create(reservation)
        await loadWallet()
        return entry
      }
      const entry = storage.addReservation(reservation)
      setReservations(storage.getReservations())
      return entry
    },
    [loadWallet]
  )

  const setReservationStatus = useCallback(
    async (id, status) => {
      if (USE_API) {
        await api.reservations.setStatus(id, status)
        await loadWallet()
        return
      }
      const res = storage.getReservations().find((r) => r.id === id)
      setReservations(storage.updateReservation(id, { status }))
      // Completing a reservation consumes one unit of its voucher.
      if (status === 'completed' && res && res.membershipId && res.templateId) {
        consumeVoucher(res.membershipId, res.templateId)
      }
    },
    [consumeVoucher, loadWallet]
  )

  const deleteReservation = useCallback(
    async (id) => {
      if (USE_API) {
        await api.reservations.remove(id)
        await loadWallet()
        return
      }
      setReservations(storage.removeReservation(id))
    },
    [loadWallet]
  )

  /* ----- transfers (gifts) ----- */
  const createTransfer = useCallback(
    async (transfer) => {
      if (USE_API) {
        const entry = await api.transfers.create(transfer)
        await loadWallet()
        return entry
      }
      const entry = storage.addTransfer(transfer)
      setTransfers(storage.getTransfers())
      return entry
    },
    [loadWallet]
  )

  /* ----- orders / purchases ----- */
  const createOrder = useCallback(
    async (order) => {
      if (USE_API) {
        const entry = await api.orders.create(order)
        await loadWallet()
        return entry
      }
      const entry = storage.addOrder(order)
      setOrders(storage.getOrders())
      return entry
    },
    [loadWallet]
  )

  // Advancing an order to 'activated' grants the membership (wallet vouchers).
  const setOrderStatus = useCallback(
    async (id, status) => {
      if (USE_API) {
        await api.orders.setStatus(id, status)
        await loadWallet()
        return
      }
      const order = storage.getOrders().find((o) => o.id === id)
      setOrders(storage.updateOrder(id, { status }))
      if (status === 'activated' && order?.membershipId) {
        setSavedIds(storage.saveMembership(order.membershipId))
      }
    },
    [loadWallet]
  )

  const deleteOrder = useCallback((id) => {
    if (USE_API) return // backend keeps order history; no delete endpoint
    setOrders(storage.removeOrder(id))
  }, [])

  const value = useMemo(
    () => ({
      lang, setLang, city, setCity, t,
      savedIds, isSaved, addSaved, removeSaved, toggleSaved,
      compareIds, inCompare, toggleCompare, removeFromCompare, maxCompare: MAX_COMPARE,
      usage, usedCount, getVoucherStats, consumeVoucher,
      reservations, createReservation, setReservationStatus, deleteReservation,
      transfers, createTransfer,
      orders, createOrder, setOrderStatus, deleteOrder,
      reloadForUser,
      walletReady, walletError, reloadWallet: loadWallet,
      toast, showToast,
    }),
    [
      lang, setLang, city, setCity, t,
      savedIds, isSaved, addSaved, removeSaved, toggleSaved,
      compareIds, inCompare, toggleCompare, removeFromCompare,
      usage, usedCount, getVoucherStats, consumeVoucher,
      reservations, createReservation, setReservationStatus, deleteReservation,
      transfers, createTransfer,
      orders, createOrder, setOrderStatus, deleteOrder,
      reloadForUser,
      walletReady, walletError, loadWallet,
      toast, showToast,
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
