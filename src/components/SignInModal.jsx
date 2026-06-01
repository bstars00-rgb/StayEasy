import { useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useApp } from '../context/AppContext.jsx'
import { useTranslation } from '../i18n/useTranslation.js'
import { isRealGoogleEnabled, renderRealGoogleButton, demoUser } from '../auth/google.js'
import { Modal } from './ui.jsx'
import Icon from './Icon.jsx'

// Google "G" mark.
function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.2 13.4 17.6 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8C43.9 37.7 46.5 31.6 46.5 24.5z" />
      <path fill="#FBBC05" d="M10.4 28.3c-.5-1.5-.8-3.1-.8-4.8s.3-3.3.8-4.8l-7.8-6.1C.9 16 0 19.9 0 24s.9 8 2.6 11.4l7.8-6.1z" />
      <path fill="#34A853" d="M24 48c6.2 0 11.5-2 15.3-5.5l-7.5-5.8c-2 1.4-4.7 2.3-7.8 2.3-6.4 0-11.8-3.9-13.6-9.4l-7.8 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  )
}

export default function SignInModal() {
  const { t } = useTranslation()
  const { showToast } = useApp()
  const { signInOpen, closeSignIn, completeSignIn } = useAuth()
  const realButtonRef = useRef(null)
  const real = isRealGoogleEnabled()

  function onUser(profile) {
    completeSignIn(profile)
    showToast(t('auth.signedIn'))
  }

  // Render the official Google button when a real client id is configured.
  useEffect(() => {
    if (signInOpen && real && realButtonRef.current) {
      renderRealGoogleButton(realButtonRef.current, onUser).catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signInOpen, real])

  function demoSignIn() {
    onUser(demoUser())
  }

  return (
    <Modal open={signInOpen} onClose={closeSignIn} title={t('auth.signInTitle')}>
      <p className="-mt-2 mb-4 text-sm text-slate-500">{t('auth.signInSubtitle')}</p>

      {real ? (
        // Official GIS button mounts here.
        <div ref={realButtonRef} className="flex justify-center" />
      ) : (
        <button
          onClick={demoSignIn}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
        >
          <GoogleMark />
          {t('auth.continueWithGoogle')}
        </button>
      )}

      {!real && <p className="mt-2 text-center text-[11px] text-slate-400">{t('auth.demoNote')}</p>}

      <button onClick={closeSignIn} className="mt-3 w-full rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50">
        {t('auth.browseAsGuest')}
      </button>

      <p className="mt-4 flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-400">
        <Icon name="check" size={13} className="mt-0.5 shrink-0 text-slate-300" />
        {t('auth.terms')}
      </p>
    </Modal>
  )
}
