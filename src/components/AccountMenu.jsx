import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useApp } from '../context/AppContext.jsx'
import { useTranslation } from '../i18n/useTranslation.js'
import Icon from './Icon.jsx'

// Header account control: a "Sign in" pill for guests, or an avatar that opens
// an anchored dropdown (name/email + partner dashboard + sign out).
export default function AccountMenu() {
  const { t } = useTranslation()
  const { showToast } = useApp()
  const { user, openSignIn, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  if (!user) {
    return (
      <button
        onClick={() => openSignIn()}
        className="rounded-full bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-100"
      >
        {t('auth.signIn')}
      </button>
    )
  }

  const initial = (user.name || user.email || '?').trim().charAt(0).toUpperCase()
  const Avatar = ({ size }) => (
    <span
      className="flex items-center justify-center overflow-hidden rounded-full bg-brand-500 font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {user.picture ? (
        <img src={user.picture} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        initial
      )}
    </span>
  )

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full"
        aria-label={t('auth.account')}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar size={32} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-cardhover">
          <div className="flex items-center gap-3 border-b border-slate-100 p-3">
            <Avatar size={40} />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">{user.name}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
          <div className="p-1.5">
            <button
              onClick={() => {
                setOpen(false)
                navigate('/partner')
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Icon name="compare" size={16} className="text-slate-400" />
              {t('partner.open')}
            </button>
            <button
              onClick={() => {
                signOut()
                setOpen(false)
                showToast(t('auth.signedOut'))
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              <Icon name="close" size={16} className="text-slate-400" />
              {t('auth.signOut')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
