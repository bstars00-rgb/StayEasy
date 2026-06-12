import { useState, useRef, useEffect } from 'react'
import { cities } from '../data/cities.js'
import { useApp } from '../context/AppContext.jsx'
import { useTranslation } from '../i18n/useTranslation.js'
import Icon from './Icon.jsx'

// `compact` (default) renders the header pill; otherwise a full-width control.
// Opens an anchored dropdown right under the button (no full-screen sheet).
export default function CitySelector({ compact = true }) {
  const { city, setCity } = useApp()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className={`relative ${compact ? '' : 'w-full'}`} ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={
          compact
            ? 'flex items-center gap-1 text-sm font-semibold text-slate-700'
            : 'flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left font-semibold text-slate-800'
        }
      >
        <span className="flex items-center gap-1.5">
          <Icon name="pin" size={16} className="text-brand-500" />
          {t(`cities.${city}`)}
        </span>
        <Icon name="chevronDown" size={compact ? 14 : 18} className="text-slate-400" />
      </button>

      {open && (
        <div
          className={`absolute z-50 mt-2 max-h-[60vh] w-60 overflow-y-auto rounded-2xl border border-slate-100 bg-white p-1.5 shadow-cardhover ${compact ? 'right-0' : 'left-0'}`}
          role="listbox"
        >
          {cities.map((c) => (
            <button
              key={c.id}
              role="option"
              aria-selected={c.id === city}
              onClick={() => {
                setCity(c.id)
                setOpen(false)
              }}
              className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition ${
                c.id === city ? 'bg-brand-50' : 'hover:bg-slate-50'
              }`}
            >
              <span className="text-xl">{c.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-900">{t(`cities.${c.id}`)}</span>
                <span className="block text-xs text-slate-500">{t(`countries.${c.country}`)}</span>
              </span>
              {c.id === city && <Icon name="check" size={16} className="text-brand-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
