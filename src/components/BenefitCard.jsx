import { useTranslation } from '../i18n/useTranslation.js'
import { formatMoney, formatDate, daysUntil } from '../utils/format.js'
import StatusBadge from './StatusBadge.jsx'
import Icon from './Icon.jsx'

// Derive the display state from stored status + expiry date.
function deriveState(benefit) {
  if (benefit.status === 'used') return 'used'
  const days = daysUntil(benefit.expiry)
  if (days != null && days < 0) return 'expired'
  if (days != null && days <= 30) return 'expiringSoon'
  return 'unused'
}

export default function BenefitCard({ benefit, onMarkUsed, onDelete }) {
  const { t, lang } = useTranslation()
  const state = deriveState(benefit)
  const days = daysUntil(benefit.expiry)
  const dim = state === 'used' || state === 'expired'

  return (
    <div
      className={`card p-4 ${dim ? 'opacity-70' : ''} ${
        state === 'expiringSoon' ? 'ring-1 ring-rose-200' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-bold text-slate-900">{benefit.title}</p>
          <p className="truncate text-xs text-slate-500">
            {benefit.membershipName || '—'} · {t(`form.type_${benefit.type}`)}
          </p>
        </div>
        <StatusBadge state={state} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-1.5 text-slate-500">
          <Icon name="clock" size={15} />
          {formatDate(benefit.expiry, lang) || '—'}
        </div>
        <div className="text-right font-semibold text-slate-700">
          {benefit.value ? formatMoney(benefit.value, benefit.currency, lang) : ''}
        </div>
      </div>

      {state !== 'used' && days != null && (
        <p className={`mt-1 text-xs font-medium ${state === 'expired' ? 'text-slate-400' : state === 'expiringSoon' ? 'text-rose-600' : 'text-slate-500'}`}>
          {days < 0
            ? t('status.expired')
            : days === 0
            ? t('status.expiresToday')
            : `${t('myBenefits.daysRemaining')}: ${days}`}
        </p>
      )}

      {benefit.notes && <p className="mt-2 text-sm text-slate-600">{benefit.notes}</p>}

      <div className="mt-3 flex gap-2">
        {benefit.status !== 'used' && (
          <button
            onClick={() => onMarkUsed(benefit.id)}
            className="btn-secondary flex-1 !py-2 text-xs"
          >
            <Icon name="check" size={15} />
            {t('myBenefits.markAsUsed')}
          </button>
        )}
        <button
          onClick={() => onDelete(benefit.id)}
          className="btn-ghost !py-2 text-xs text-slate-500"
          aria-label={t('common.delete')}
        >
          <Icon name="trash" size={15} />
        </button>
      </div>
    </div>
  )
}
