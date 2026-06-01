import Icon from './Icon.jsx'

// Compact recommendation-score pill. Color reflects the value band.
export default function ScoreBadge({ score, showIcon = true, className = '' }) {
  const v = Math.round(Number(score) || 0)
  const tone =
    v >= 85 ? 'bg-emerald-50 text-emerald-700' : v >= 70 ? 'bg-brand-50 text-brand-700' : 'bg-amber-50 text-amber-700'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${tone} ${className}`}>
      {showIcon && <Icon name="sparkles" size={13} />}
      {v}
    </span>
  )
}
