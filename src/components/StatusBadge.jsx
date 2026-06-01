import { useTranslation } from '../i18n/useTranslation.js'

// Voucher/benefit status badge. `state` is one of:
// unused | used | expired | expiringSoon | active
export default function StatusBadge({ state }) {
  const { t } = useTranslation()
  const tones = {
    unused: 'bg-brand-50 text-brand-700',
    active: 'bg-emerald-50 text-emerald-700',
    used: 'bg-slate-100 text-slate-500',
    expired: 'bg-slate-100 text-slate-400',
    expiringSoon: 'bg-rose-50 text-rose-600',
  }
  return (
    <span className={`chip ${tones[state] || tones.unused}`}>{t(`status.${state}`)}</span>
  )
}
