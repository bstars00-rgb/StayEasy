import { createContext, useContext, useState, useCallback, useRef, useMemo } from 'react'
import * as storage from '../utils/storage.js'
import { api, USE_API } from '../api/index.js'
import { useApp } from './AppContext.jsx'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { reloadForUser } = useApp()
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

  // Persist the profile, switch to the user's data scope, then resume any
  // queued action (so it writes to the user's own wallet). In API mode this
  // first exchanges the sign-in for a backend session token.
  const completeSignIn = useCallback(
    async (profile) => {
      let next = { ...profile, signedInAt: new Date().toISOString() }
      if (USE_API) {
        try {
          const data = await api.auth.google(profile.idToken || profile.id || profile.email || 'demo')
          const token = data.accessToken || data.token
          next = { ...(data.user || profile), token, accessToken: token, signedInAt: new Date().toISOString() }
        } catch {
          /* fall back to local profile (no token) */
        }
      }
      storage.setAuthUser(next)
      setUser(next)
      setSignInOpen(false)
      reloadForUser(next)
      const action = pendingAction.current
      pendingAction.current = null
      if (action) action()
    },
    [reloadForUser]
  )

  const signOut = useCallback(() => {
    storage.clearAuthUser()
    setUser(null)
    reloadForUser(null) // back to guest scope
  }, [reloadForUser])

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
