import { useMemo, useState } from 'react'
import { useTranslation } from '../i18n/useTranslation.js'
import { formatDate } from '../utils/format.js'
import { evaluateDate, toIsoDate, parseLocalDate, firstAvailableDate } from '../data/availability.js'

const INTL_LOCALE = { en: 'en-US', ko: 'ko-KR', vi: 'vi-VN', zh: 'zh-CN', ja: 'ja-JP' }
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '')
const monthIndex = (y, m) => y * 12 + m

// A readable month calendar that shows which dates are bookable for a voucher.
// Available days are selectable; unavailable/holiday days are dimmed but
// tappable to reveal *why* (weekend, lead time, Tết/Seollal closure, ...).
export default function AvailabilityCalendar({ rule, value, onChange }) {
  const { t, lang } = useTranslation()
  const today = useMemo(() => new Date(), [])
  const locale = INTL_LOCALE[lang] || 'en-US'

  // Open on the month of the current selection, else the first bookable date.
  const initial = useMemo(() => {
    const seed = parseLocalDate(value) || firstAvailableDate(rule, today) || today
    return { y: seed.getFullYear(), m: seed.getMonth() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const [view, setView] = useState(initial)
  const [reason, setReason] = useState(null)

  const weekdayLabels = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: 'short' })
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2023, 0, 1 + i))) // Jan 1 2023 = Sun
  }, [locale])

  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long' }).format(new Date(view.y, view.m, 1)),
    [locale, view],
  )

  // Booking window bounds (in whole months) for prev/next.
  const minIdx = monthIndex(today.getFullYear(), today.getMonth())
  const maxDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (rule?.maxAdvanceDays ?? 180))
  const maxIdx = monthIndex(maxDate.getFullYear(), maxDate.getMonth())
  const curIdx = monthIndex(view.y, view.m)
  const canPrev = curIdx > minIdx
  const canNext = curIdx < maxIdx

  const move = (delta) => {
    const d = new Date(view.y, view.m + delta, 1)
    setView({ y: d.getFullYear(), m: d.getMonth() })
    setReason(null)
  }

  const startPad = new Date(view.y, view.m, 1).getDay()
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate()
  const todayIso = toIsoDate(today)

  const reasonLabel = (ev) => {
    if (!ev) return ''
    if (ev.reason === 'holiday') return t('calendar.reasonHoliday', { name: t(`calendar.holiday${cap(ev.holidayKey)}`) })
    return t(`calendar.reason${cap(ev.reason)}`, { n: rule?.minLeadDays || 0 })
  }

  const onDay = (iso, ev) => {
    if (ev.ok) {
      onChange(iso)
      setReason(null)
    } else {
      setReason({ iso, ev })
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      {/* Header: month + nav */}
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => move(-1)}
          disabled={!canPrev}
          aria-label="Previous month"
          className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30"
        >
          ‹
        </button>
        <span className="text-sm font-bold text-slate-800">{monthLabel}</span>
        <button
          type="button"
          onClick={() => move(1)}
          disabled={!canNext}
          aria-label="Next month"
          className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30"
        >
          ›
        </button>
      </div>

      {/* Weekday header */}
      <div className="mb-1 grid grid-cols-7 text-center text-[11px] font-semibold text-slate-400">
        {weekdayLabels.map((w, i) => (
          <span key={i} className={i === 0 || i === 6 ? 'text-rose-300' : ''}>
            {w}
          </span>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: startPad }, (_, i) => (
          <span key={`pad-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const iso = toIsoDate(new Date(view.y, view.m, day))
          const ev = evaluateDate(rule, iso, today)
          const selected = value === iso
          const isToday = iso === todayIso
          const isHoliday = ev.reason === 'holiday'

          let cls = 'text-slate-700 hover:bg-brand-50'
          if (selected) cls = 'bg-brand-600 font-bold text-white'
          else if (isHoliday) cls = 'bg-rose-50 text-rose-400'
          else if (!ev.ok) cls = 'text-slate-300'

          return (
            <button
              key={iso}
              type="button"
              data-cal-iso={iso}
              data-cal-state={ev.ok ? 'available' : 'unavailable'}
              onClick={() => onDay(iso, ev)}
              className={`relative flex h-9 items-center justify-center rounded-lg text-sm tabular-nums transition ${cls} ${
                isToday && !selected ? 'ring-1 ring-brand-300' : ''
              }`}
            >
              {day}
              {isHoliday && !selected && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-rose-400" />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
        <LegendDot className="bg-brand-600" label={t('calendar.legendAvailable')} />
        <LegendDot className="bg-slate-200" label={t('calendar.legendUnavailable')} />
        <LegendDot className="bg-rose-400" label={t('calendar.legendHoliday')} />
      </div>

      {/* Why-unavailable hint */}
      {reason && (
        <p className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {formatDate(reason.iso, lang)} · {reasonLabel(reason.ev)}
        </p>
      )}
    </div>
  )
}

function LegendDot({ className, label }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${className}`} />
      {label}
    </span>
  )
}
