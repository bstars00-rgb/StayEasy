import { useEffect, useState } from 'react'
import Icon from './Icon.jsx'

const STORAGE_KEY = 'ohmyselect.theme'

function preferredDark() {
  if (typeof window === 'undefined') return false
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored) return stored === 'dark'
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

function applyTheme(isDark) {
  document.documentElement.classList.toggle('dark', isDark)
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
}

export default function ThemeToggle({ compact = false }) {
  const [isDark, setIsDark] = useState(preferredDark)

  useEffect(() => {
    applyTheme(isDark)
    window.localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light')
  }, [isDark])

  return (
    <button
      type="button"
      onClick={() => setIsDark((value) => !value)}
      className={`inline-flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 ${
        compact ? 'h-8 w-8' : 'h-9 w-9'
      }`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <Icon name={isDark ? 'sun' : 'moon'} size={compact ? 16 : 18} />
    </button>
  )
}
