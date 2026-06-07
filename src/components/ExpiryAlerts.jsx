import { useMemo } from 'react'
import { useTranslation } from '../i18n/useTranslation.js'
import { daysUntil, formatDate } from '../utils/format.js'
import { localizeVoucher } from '../data/voucherI18n.js'
import Icon from './Icon.jsx'

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

// Consolidated expiry alert center: surfaces wallet vouchers that are still
// usable (available > 0) and expired-unused or expiring within 30 days,
// grouped by urgency, with a quick "use benefit" action.
export default function ExpiryAlerts({ vouchers, getStats, onRequest }) {
  const { t, lang } = useTranslation()

  const items = useMemo(() => {
    const list = []
    for (const { membership, template } of vouchers) {
      const { available } = getStats(membership.id, template)
      if (available <= 0) continue
      const d = daysUntil(template.validUntil)
      if (d == null || d > 30) continue // only expired-unused or ≤30 days
      list.push({ membership, template, available, d })
    }
    return list.sort((a, b) => a.d - b.d)
  }, [vouchers, getStats])

  if (items.length === 0) return null

  const groups = [
    { key: 'expired', items: items.filter((i) => i.d < 0) },
    { key: 'urgent', items: items.filter((i) => i.d >= 0 && i.d <= 7) },
    { key: 'soon', items: items.filter((i) => i.d > 7 && i.d <= 30) },
  ].filter((g) => g.items.length)

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
          <Icon name="clock" size={17} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900">{t('expiry.title')}</p>
          <p className="text-xs text-slate-500">{t('expiry.summary', { count: items.length })}</p>
        </div>
      </div>

      <div className="space-y-3">
        {groups.map((g) => (
          <div key={g.key}>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {t('expiry.group' + cap(g.key))} ({g.items.length})
            </p>
            <ul className="space-y-2">
              {g.items.map(({ membership, template, available, d }) => {
                const v = localizeVoucher(template, lang)
                const expired = d < 0
                const chipText = expired
                  ? t('expiry.expiredOn', { date: formatDate(template.validUntil, lang) })
                  : d === 0
                    ? t('expiry.today')
                    : t('expiry.daysLeft', { n: d })
                const chipTone = expired || d <= 7 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                return (
                  <li
                    key={`${membership.id}:${template.templateId}`}
                    data-expiry-item={expired ? 'expired' : d <= 7 ? 'urgent' : 'soon'}
                    className="flex items-center gap-2.5 rounded-xl bg-white p-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{v.title}</p>
                      <p className="truncate text-xs text-slate-400">
                        {membership.name} · {t('expiry.qtyLeft', { n: available })}
                      </p>
                    </div>
                    <span className={`chip shrink-0 ${chipTone}`}>{chipText}</span>
                    {!expired && onRequest && (
                      <button
                        onClick={() => onRequest(membership, template)}
                        className="btn-secondary shrink-0 !px-3 !py-1.5 text-xs"
                      >
                        {t('expiry.book')}
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
