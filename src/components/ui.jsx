import Icon from './Icon.jsx'
import { accentFor } from './brandTheme.js'

export function Chip({ children, tone = 'brand', className = '' }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-700',
    slate: 'bg-slate-100 text-slate-600',
    amber: 'bg-amber-50 text-amber-700',
    green: 'bg-emerald-50 text-emerald-700',
    red: 'bg-rose-50 text-rose-700',
    white: 'bg-white/20 text-white',
  }
  return <span className={`chip ${tones[tone]} ${className}`}>{children}</span>
}

export function RatingStars({ rating }) {
  return (
    <span className="inline-flex items-center gap-1 text-amber-500">
      <Icon name="star" size={15} />
      <span className="text-sm font-semibold text-slate-700">{Number(rating).toFixed(1)}</span>
    </span>
  )
}

export function BrandAvatar({ membership, size = 48, className = '' }) {
  const [from, to] = membership.accent || accentFor(membership.brand)
  const initials = membership.brand.slice(0, 2).toUpperCase()
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl font-bold text-white ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.34,
        background: `linear-gradient(135deg, ${from}, ${to})`,
      }}
    >
      {initials}
    </div>
  )
}

export function SectionTitle({ children, action }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-base font-bold text-slate-900">{children}</h2>
      {action}
    </div>
  )
}

// Labeled 0–100 progress bar used in Compare and Membership detail.
export function ScoreBar({ label, value }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0))
  const color = v >= 85 ? 'bg-emerald-500' : v >= 70 ? 'bg-brand-500' : 'bg-amber-400'
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="font-semibold text-slate-800">{v}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${v}%` }} />
      </div>
    </div>
  )
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/55 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 shadow-cardhover sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
            aria-label="Close"
          >
            <Icon name="close" size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
