import { useMemo } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { useTranslation } from '../i18n/useTranslation.js'
import { getMembership } from '../data/memberships.js'
import { formatMoney } from '../utils/format.js'
import EmptyState from '../components/EmptyState.jsx'
import Icon from '../components/Icon.jsx'

const STATUSES = ['requested', 'invoiced', 'paid', 'activated', 'cancelled']
const EARNED = ['paid', 'activated']

export default function Partner() {
  const { t, lang } = useTranslation()
  const { orders, savedIds, reservations } = useApp()

  const data = useMemo(() => {
    const earned = orders.filter((o) => EARNED.includes(o.status))
    const byCurrency = {}
    earned.forEach((o) => {
      const c = (byCurrency[o.currency] ||= { gmv: 0, commission: 0 })
      c.gmv += o.paidAmount || 0
      c.commission += o.commissionAmount || 0
    })
    const statusCounts = STATUSES.map((s) => ({ status: s, count: orders.filter((o) => o.status === s).length }))
    const byMembership = {}
    orders.forEach((o) => {
      const m = (byMembership[o.membershipId] ||= { count: 0, commission: 0, currency: o.currency })
      m.count += 1
      if (EARNED.includes(o.status)) m.commission += o.commissionAmount || 0
    })
    return { earned, byCurrency, statusCounts, byMembership }
  }, [orders])

  const maxStatus = Math.max(1, ...data.statusCounts.map((s) => s.count))

  return (
    <div className="page-pad space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">{t('partner.title')}</h1>
        <p className="text-sm text-slate-500">{t('partner.subtitle')}</p>
      </div>

      {/* KPIs */}
      <section className="grid grid-cols-2 gap-2.5">
        <Kpi icon="tag" label={t('partner.orders')} value={orders.length} />
        <Kpi icon="check" label={t('partner.paid')} value={data.earned.length} tone="brand" />
        <Kpi icon="bookmark" label={t('partner.memberships')} value={savedIds.length} />
        <Kpi icon="calendar" label={t('partner.reservations')} value={reservations.length} />
      </section>

      {orders.length === 0 ? (
        <EmptyState icon="tag" title={t('partner.empty')} />
      ) : (
        <>
          {/* GMV + commission per currency */}
          <section className="rounded-xl2 border border-brand-200 bg-brand-50/50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Icon name="sparkles" size={16} className="text-brand-600" />
              <h2 className="text-sm font-bold text-brand-800">{t('order.internalTitle')}</h2>
            </div>
            <div className="space-y-2">
              {Object.entries(data.byCurrency).map(([currency, v]) => (
                <div key={currency} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">
                    {t('partner.gmv')}: <span className="font-semibold text-slate-800">{formatMoney(v.gmv, currency, lang)}</span>
                  </span>
                  <span className="font-bold text-brand-700">
                    {t('partner.commission')}: {formatMoney(v.commission, currency, lang)}
                  </span>
                </div>
              ))}
              {Object.keys(data.byCurrency).length === 0 && <p className="text-sm text-slate-400">—</p>}
            </div>
          </section>

          {/* Orders by status */}
          <section>
            <h2 className="mb-3 text-base font-bold text-slate-900">{t('partner.byStatus')}</h2>
            <div className="card space-y-2.5 p-4">
              {data.statusCounts.map(({ status, count }) => (
                <div key={status}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">{t(`order.status${cap(status)}`)}</span>
                    <span className="font-semibold text-slate-800">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${(count / maxStatus) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* By membership */}
          <section>
            <h2 className="mb-3 text-base font-bold text-slate-900">{t('partner.byMembership')}</h2>
            <div className="card divide-y divide-slate-100">
              {Object.entries(data.byMembership).map(([id, v]) => {
                const m = getMembership(id)
                return (
                  <div key={id} className="flex items-center justify-between px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{m?.name || id}</p>
                      <p className="text-xs text-slate-400">
                        {t('partner.colOrders')}: {v.count}
                      </p>
                    </div>
                    <span className="font-bold text-brand-700">{formatMoney(v.commission, v.currency, lang)}</span>
                  </div>
                )
              })}
            </div>
          </section>
        </>
      )}

      <p className="rounded-xl bg-slate-50 p-3 text-center text-[11px] leading-relaxed text-slate-400">
        {t('partner.note')}
      </p>
    </div>
  )
}

function Kpi({ icon, label, value, tone = 'slate' }) {
  const tones = { slate: 'bg-slate-100 text-slate-500', brand: 'bg-brand-50 text-brand-600' }
  return (
    <div className="card flex items-center gap-3 p-3">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon name={icon} size={18} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-lg font-extrabold leading-tight text-slate-900 tabular-nums">{value}</p>
        <p className="truncate text-[11px] text-slate-500">{label}</p>
      </div>
    </div>
  )
}

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
