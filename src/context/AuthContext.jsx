import { createContext, useContext, useState, useCallback, useRef, useMemo } from 'react'
import * as storage from '../utils/storage.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => storage.getAuthUser())
  const [signInOpen, setSignInOpen] = useState(false)
  const pendingAction = useRef(null)

  const isAuthed = !!user

  // Open the sign-in modal, optionally queuing an action to run on success.
  const openSignIn = useCallback((onSuccess) => {
    pendingAction.current = typeof onSuccess === 'function' ? onSuccess : null
    setSignInOpen(true)
  }, [])

  const closeSignIn = useCallback(() => {
    pendingAction.current = null
    setSignInOpen(false)
  }, [])

  // Persist the profile and resume any queued action.
  const completeSignIn = useCallback((profile) => {
    const next = { ...profile, signedInAt: new Date().toISOString() }
    storage.setAuthUser(next)
    setUser(next)
    setSignInOpen(false)
    const action = pendingAction.current
    pendingAction.current = null
    if (action) action()
  }, [])

  const signOut = useCallback(() => {
    storage.clearAuthUser()
    setUser(null)
  }, [])

  // Run `fn` if signed in; otherwise prompt sign-in and resume afterwards.
  const requireAuth = useCallback(
    (fn) => {
      if (user) fn()
      else openSignIn(fn)
    },
    [user, openSignIn]
  )

  const value = useMemo(
    () => ({ user, isAuthed, signInOpen, openSignIn, closeSignIn, completeSignIn, signOut, requireAuth }),
    [user, isAuthed, signInOpen, openSignIn, closeSignIn, completeSignIn, signOut, requireAuth]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
