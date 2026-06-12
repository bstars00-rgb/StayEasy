import { useState, useEffect } from 'react'
import { useTranslation } from '../i18n/useTranslation.js'
import Icon from './Icon.jsx'

const DISMISS_KEY = 'stayeasy.pwaDismissed'

// "Add to Home Screen" banner. Listens for the browser's beforeinstallprompt
// (Chrome/Android), then triggers the native install dialog on tap. Hidden if
// already installed or previously dismissed.
export default function InstallPrompt() {
  const { t } = useTranslation()
  const [deferred, setDeferred] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY)) return
    } catch {
      /* ignore */
    }
    const onPrompt = (e) => {
      e.preventDefault()
      setDeferred(e)
      setVisible(true)
    }
    const onInstalled = () => setVisible(false)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const dismiss = () => {
    setVisible(false)
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      /* ignore */
    }
  }

  const install = async () => {
    if (!deferred) return
    deferred.prompt()
    try {
      await deferred.userChoice
    } catch {
      /* ignore */
    }
    setDeferred(null)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-[68px] z-40 px-3">
      <div className="mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-cardhover">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Icon name="bookmark" size={18} />
        </span>
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">{t('home.installTitle')}</p>
        <button onClick={install} className="shrink-0 rounded-full bg-brand-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-brand-700">
          {t('home.installCta')}
        </button>
        <button onClick={dismiss} aria-label={t('home.installDismiss')} className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-100">
          <Icon name="close" size={18} />
        </button>
      </div>
    </div>
  )
}
