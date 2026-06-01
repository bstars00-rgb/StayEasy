import { createContext, useContext, useState, useCallback, useRef, useMemo } from 'react'
import { translate, DEFAULT_LANG } from '../i18n/translations.js'
import { DEFAULT_CITY } from '../data/cities.js'
import { getVoucherTemplate } from '../data/voucherPacks.js'
import { voucherStats, countOpenReservations } from '../utils/vouchers.js'
import * as storage from '../utils/storage.js'

const MAX_COMPARE = 3
const COMPARE_KEY = 'stayeasy.compare'
const DEFAULT_COMPARE = ['club-marriott-vietnam', 'accor-plus-vietnam']

function readCompare() {
  try {
    const raw = window.localStorage.getItem(COMPARE_KEY)
    if (raw != null) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return DEFAULT_COMPARE
}

function writeCompare(ids) {
  try {
    window.localStorage.setItem(COMPARE_KEY, JSON.stringify(ids))
  } catch {
    /* ignore */
  }
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [lang, setLangState] = useState(() => storage.getSelectedLanguage() || DEFAULT_LANG)
  const [city, setCityState] = useState(() => storage.getSelectedCity() || DEFAULT_CITY)
  const [savedIds, setSavedIds] = useState(() => storage.getSavedMemberships())
  const [compareIds, setCompareIds] = useState(() => readCompare())
  const [usage, setUsage] = useState(() => storage.getVoucherUsage())
  const [reservations, setReservations] = useState(() => storage.getReservations())
  const [orders, setOrders] = useState(() => storage.getOrders())
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

  /* ----- saved memberships ----- */
  const isSaved = useCallback((id) => savedIds.includes(id), [savedIds])

  const addSaved = useCallback((membership) => {
    setSavedIds(storage.saveMembership(membership))
  }, [])

  // Removing a membership also purges its orphaned voucher usage and
  // reservations (orders are kept as historical purchase records).
  const removeSaved = useCallback((id) => {
    setSavedIds(storage.removeMembership(id))
    const { usage: u, reservations: r } = storage.removeMembershipArtifacts(id)
    setUsage(u)
    setReservations(r)
  }, [])

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
      writeCompare(next)
      return next
    })
  }, [])

  const removeFromCompare = useCallback((id) => {
    setCompareIds((prev) => {
      const next = prev.filter((x) => x !== id)
      writeCompare(next)
      return next
    })
  }, [])

  /* ----- voucher usage ----- */
  const usedCount = useCallback(
    (membershipId, templateId) => usage[`${membershipId}:${templateId}`] || 0,
    [usage]
  )

  // Inventory for a voucher template, accounting for consumed + held units.
  const getVoucherStats = useCallback(
    (membershipId, template) => {
      const used = usage[`${membershipId}:${template.templateId}`] || 0
      const held = countOpenReservations(reservations, membershipId, template.templateId)
      return voucherStats(template.quantity, used, held)
    },
    [usage, reservations]
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
  const createReservation = useCallback((reservation) => {
    const entry = storage.addReservation(reservation)
    setReservations(storage.getReservations())
    return entry
  }, [])

  const setReservationStatus = useCallback(
    (id, status) => {
      const res = storage.getReservations().find((r) => r.id === id)
      setReservations(storage.updateReservation(id, { status }))
      // Completing a reservation consumes one unit of its voucher.
      if (status === 'completed' && res && res.membershipId && res.templateId) {
        consumeVoucher(res.membershipId, res.templateId)
      }
    },
    [consumeVoucher]
  )

  const deleteReservation = useCallback((id) => {
    setReservations(storage.removeReservation(id))
  }, [])

  /* ----- orders / purchases ----- */
  const createOrder = useCallback((order) => {
    const entry = storage.addOrder(order)
    setOrders(storage.getOrders())
    return entry
  }, [])

  // Advancing an order to 'activated' grants the membership (wallet vouchers).
  const setOrderStatus = useCallback(
    (id, status) => {
      const order = storage.getOrders().find((o) => o.id === id)
      setOrders(storage.updateOrder(id, { status }))
      if (status === 'activated' && order?.membershipId) {
        setSavedIds(storage.saveMembership(order.membershipId))
      }
    },
    []
  )

  const deleteOrder = useCallback((id) => {
    setOrders(storage.removeOrder(id))
  }, [])

  const value = useMemo(
    () => ({
      lang, setLang, city, setCity, t,
      savedIds, isSaved, addSaved, removeSaved, toggleSaved,
      compareIds, inCompare, toggleCompare, removeFromCompare, maxCompare: MAX_COMPARE,
      usage, usedCount, getVoucherStats, consumeVoucher,
      reservations, createReservation, setReservationStatus, deleteReservation,
      orders, createOrder, setOrderStatus, deleteOrder,
      toast, showToast,
    }),
    [
      lang, setLang, city, setCity, t,
      savedIds, isSaved, addSaved, removeSaved, toggleSaved,
      compareIds, inCompare, toggleCompare, removeFromCompare,
      usage, usedCount, getVoucherStats, consumeVoucher,
      reservations, createReservation, setReservationStatus, deleteReservation,
      orders, createOrder, setOrderStatus, deleteOrder,
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
