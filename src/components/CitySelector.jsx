import { useState } from 'react'
import { cities } from '../data/cities.js'
import { useApp } from '../context/AppContext.jsx'
import { useTranslation } from '../i18n/useTranslation.js'
import Icon from './Icon.jsx'
import { Modal } from './ui.jsx'

// `compact` (default) renders the header pill; otherwise a full-width control.
export default function CitySelector({ compact = true }) {
  const { city, setCity } = useApp()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
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

      <Modal open={open} onClose={() => setOpen(false)} title={t('home.selectCity')}>
        <div className="grid grid-cols-1 gap-2">
          {cities.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setCity(c.id)
                setOpen(false)
              }}
              className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${
                c.id === city ? 'border-brand-400 bg-brand-50' : 'border-slate-100 hover:bg-slate-50'
              }`}
            >
              <span className="text-2xl">{c.emoji}</span>
              <span className="flex-1">
                <span className="block font-semibold text-slate-900">{t(`cities.${c.id}`)}</span>
                <span className="block text-xs text-slate-500">{t(`countries.${c.country}`)}</span>
              </span>
              {c.id === city && <Icon name="check" size={18} className="text-brand-500" />}
            </button>
          ))}
        </div>
      </Modal>
    </>
  )
}
