import { useApp } from '../context/AppContext.jsx'
import { useTranslation } from '../i18n/useTranslation.js'
import { getMembership } from '../data/memberships.js'
import { formatMoney, formatDate } from '../utils/format.js'
import { Chip } from './ui.jsx'
import Icon from './Icon.jsx'

const STATUS_TONE = {
  requested: 'amber',
  invoiced: 'amber',
  paid: 'brand',
  activated: 'green',
  cancelled: 'slate',
}

// Order lifecycle: requested → invoiced → paid → activated.
// The "next step" button advances the order; activating grants the wallet.
const NEXT = {
  requested: { to: 'invoiced', labelKey: 'order.markInvoiced' },
  invoiced: { to: 'paid', labelKey: 'order.markPaid' },
  paid: { to: 'activated', labelKey: 'order.activate' },
}

export default function OrderCard({ order: o }) {
  const { t, lang } = useTranslation()
  const { setOrderStatus, deleteOrder } = useApp()
  const membership = getMembership(o.membershipId)
  const next = NEXT[o.status]
  const closed = o.status === 'activated' || o.status === 'cancelled'

  return (
    <div className={`card p-4 ${o.status === 'cancelled' ? 'opacity-70' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-bold text-slate-900">{membership?.name || o.membershipId}</p>
          <p className="text-xs text-slate-500">{t('order.createdOn', { date: formatDate(o.createdAt, lang) })}</p>
        </div>
        <Chip tone={STATUS_TONE[o.status] || 'slate'}>{t(`order.status${cap(o.status)}`)}</Chip>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
        <span className="text-sm text-slate-500">{t('order.amount')}</span>
        <span className="font-bold text-slate-900">{formatMoney(o.paidAmount, o.currency, lang)}</span>
      </div>

      {/* Lifecycle flow hint */}
      <p className="mt-2 text-[11px] text-slate-400">{t('order.flow')}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {next && (
          <button onClick={() => setOrderStatus(o.id, next.to)} className="btn-primary !py-2 text-xs">
            <Icon name="arrowRight" size={14} />
            {t(next.labelKey)}
          </button>
        )}
        {!closed && (
          <button onClick={() => setOrderStatus(o.id, 'cancelled')} className="btn-ghost !py-2 text-xs text-slate-500">
            {t('order.cancel')}
          </button>
        )}
        {closed && (
          <button onClick={() => deleteOrder(o.id)} className="btn-ghost !py-2 text-xs text-slate-500">
            <Icon name="trash" size={14} />
            {t('common.delete')}
          </button>
        )}
      </div>
    </div>
  )
}

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
