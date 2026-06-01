import { useState, useRef, useEffect } from 'react'
import { useTranslation } from '../i18n/useTranslation.js'
import Icon from './Icon.jsx'

export default function LanguageSelector() {
  const { lang, setLang, languages } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = languages.find((l) => l.code === lang) || languages[1]

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Icon name="globe" size={16} />
        <span className="max-w-[72px] truncate">{current.label}</span>
        <Icon name="chevronDown" size={14} />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-2xl border border-slate-100 bg-white py-1 shadow-cardhover" role="listbox">
          {languages.map((l) => (
            <button
              key={l.code}
              role="option"
              aria-selected={l.code === lang}
              onClick={() => {
                setLang(l.code)
                setOpen(false)
              }}
              className={`flex w-full items-center justify-between px-4 py-2.5 text-sm ${
                l.code === lang ? 'bg-brand-50 font-semibold text-brand-700' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {l.label}
              {l.code === lang && <Icon name="check" size={16} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
