import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useApp } from '../context/AppContext.jsx'
import { useTranslation } from '../i18n/useTranslation.js'
import { Modal } from './ui.jsx'
import Icon from './Icon.jsx'

// Header account control: a "Sign in" pill for guests, or an avatar that
// opens an account sheet (name/email + sign out) for signed-in users.
export default function AccountMenu() {
  const { t } = useTranslation()
  const { showToast } = useApp()
  const { user, openSignIn, signOut } = useAuth()
  const [open, setOpen] = useState(false)

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

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-brand-500 text-sm font-bold text-white"
        aria-label={t('auth.account')}
      >
        {user.picture ? (
          <img src={user.picture} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          initial
        )}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={t('auth.account')}>
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-brand-500 text-lg font-bold text-white">
            {user.picture ? (
              <img src={user.picture} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              initial
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate font-bold text-slate-900">{user.name}</p>
            <p className="truncate text-sm text-slate-500">{user.email}</p>
          </div>
        </div>

        <button
          onClick={() => {
            signOut()
            setOpen(false)
            showToast(t('auth.signedOut'))
          }}
          className="btn-ghost mt-5 w-full"
        >
          <Icon name="close" size={16} />
          {t('auth.signOut')}
        </button>
      </Modal>
    </>
  )
}
