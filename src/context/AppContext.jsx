import { createContext, useContext, useState, useCallback, useRef, useMemo } from 'react'
import { translate, DEFAULT_LANG } from '../i18n/translations.js'
import { DEFAULT_CITY } from '../data/cities.js'
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
  const [benefits, setBenefits] = useState(() => storage.getSavedBenefits())
  const [compareIds, setCompareIds] = useState(() => readCompare())
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

  const removeSaved = useCallback((id) => {
    setSavedIds(storage.removeMembership(id))
  }, [])

  const toggleSaved = useCallback(
    (id) => {
      if (savedIds.includes(id)) setSavedIds(storage.removeMembership(id))
      else setSavedIds(storage.saveMembership(id))
    },
    [savedIds]
  )

  /* ----- benefits / vouchers ----- */
  const addBenefit = useCallback((benefit) => {
    storage.saveBenefit(benefit)
    setBenefits(storage.getSavedBenefits())
  }, [])

  const editBenefit = useCallback((id, updates) => {
    setBenefits(storage.updateBenefit(id, updates))
  }, [])

  const deleteBenefit = useCallback((id) => {
    setBenefits(storage.removeBenefit(id))
  }, [])

  const markBenefitUsed = useCallback((id) => {
    setBenefits(storage.markBenefitAsUsed(id))
  }, [])

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

  const value = useMemo(
    () => ({
      lang, setLang, city, setCity, t,
      savedIds, isSaved, addSaved, removeSaved, toggleSaved,
      benefits, addBenefit, editBenefit, deleteBenefit, markBenefitUsed,
      compareIds, inCompare, toggleCompare, removeFromCompare, maxCompare: MAX_COMPARE,
      toast, showToast,
    }),
    [
      lang, setLang, city, setCity, t,
      savedIds, isSaved, addSaved, removeSaved, toggleSaved,
      benefits, addBenefit, editBenefit, deleteBenefit, markBenefitUsed,
      compareIds, inCompare, toggleCompare, removeFromCompare,
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
