import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { useTranslation } from '../i18n/useTranslation.js'
import { getMembership } from '../data/memberships.js'
import { getVoucherPack, voucherCategories } from '../data/voucherPacks.js'
import { daysUntil, formatMoney } from '../utils/format.js'
import VoucherCard from '../components/VoucherCard.jsx'
import ReservationCard from '../components/ReservationCard.jsx'
import OrderCard from '../components/OrderCard.jsx'
import BookingRequestModal from '../components/BookingRequestModal.jsx'
import EmptyState from '../components/EmptyState.jsx'
import CTAButton from '../components/CTAButton.jsx'
import Icon from '../components/Icon.jsx'

export default function MyBenefits() {
  const navigate = useNavigate()
  const { t, lang } = useTranslation()
  const { savedIds, removeSaved, getVoucherStats, reservations, orders } = useApp()

  const [tab, setTab] = useState('wallet')
  const [category, setCategory] = useState('all')
  const [booking, setBooking] = useState(null) // { membership, template }

  const ownedMemberships = useMemo(() => savedIds.map(getMembership).filter(Boolean), [savedIds])

  // Flatten all vouchers across owned memberships.
  const allVouchers = useMemo(
    () =>
      ownedMemberships.flatMap((m) =>
        getVoucherPack(m.id).map((template) => ({ membership: m, template }))
      ),
    [ownedMemberships]
  )

  // Summary metrics.
  const availableTotal = allVouchers.reduce(
    (sum, { membership, template }) => sum + getVoucherStats(membership.id, template).available,
    0
  )
  const expiringSoon = allVouchers.filter(({ membership, template }) => {
    const { available } = getVoucherStats(membership.id, template)
    const d = daysUntil(template.validUntil)
    return available > 0 && d != null && d >= 0 && d <= 30
  }).length
  const pendingCount = reservations.filter((r) => r.status === 'requested' || r.status === 'confirmed').length

  const filtered = category === 'all' ? allVouchers : allVouchers.filter((v) => v.template.category === category)

  return (
    <div className="page-pad space-y-5">
      <h1 className="text-xl font-extrabold text-slate-900">{t('myBenefits.title')}</h1>

      {/* Summary */}
      <section className="grid grid-cols-2 gap-2.5">
        <Stat label={t('wallet.myMemberships')} value={ownedMemberships.length} icon="bookmark" />
        <Stat label={t('wallet.available')} value={availableTotal} icon="ticket" tone="brand" />
        <Stat label={t('wallet.expiringSoon')} value={expiringSoon} icon="clock" tone={expiringSoon > 0 ? 'amber' : 'slate'} />
        <Stat label={t('wallet.pending')} value={pendingCount} icon="calendar" tone={pendingCount > 0 ? 'brand' : 'slate'} />
      </section>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-slate-100 p-1">
        <TabBtn active={tab === 'wallet'} onClick={() => setTab('wallet')}>
          {t('wallet.tabWallet')}
        </TabBtn>
        <TabBtn active={tab === 'reservations'} onClick={() => setTab('reservations')}>
          {t('wallet.tabReservations')} {pendingCount > 0 && `(${pendingCount})`}
        </TabBtn>
        <TabBtn active={tab === 'orders'} onClick={() => setTab('orders')}>
          {t('order.tab')} {orders.length > 0 && `(${orders.length})`}
        </TabBtn>
      </div>

      {tab === 'wallet' &&
        (ownedMemberships.length === 0 ? (
          <EmptyState icon="ticket" title={t('wallet.empty')}>
            <CTAButton variant="primary" onClick={() => navigate('/explore')}>
              {t('wallet.exploreCta')}
            </CTAButton>
          </EmptyState>
        ) : (
          <>
            {/* Owned membership chips */}
            <div className="flex flex-wrap gap-2">
              {ownedMemberships.map((m) => (
                <span key={m.id} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 py-1 pl-3 pr-1.5 text-xs font-semibold text-slate-700">
                  {m.name}
                  <button
                    onClick={() => removeSaved(m.id)}
                    className="rounded-full p-0.5 text-slate-400 hover:text-rose-500"
                    aria-label={t('wallet.removeMembership')}
                  >
                    <Icon name="close" size={13} />
                  </button>
                </span>
              ))}
            </div>

            {/* Category filter */}
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 no-scrollbar">
              <CatPill active={category === 'all'} onClick={() => setCategory('all')}>
                {t('common.all')}
              </CatPill>
              {voucherCategories.map((c) => (
                <CatPill key={c} active={category === c} onClick={() => setCategory(c)}>
                  {t(`voucherCat.${c}`)}
                </CatPill>
              ))}
            </div>

            <div className="space-y-3">
              {filtered.map(({ membership, template }) => (
                <VoucherCard
                  key={`${membership.id}:${template.templateId}`}
                  membership={membership}
                  template={template}
                  onRequest={(m, tpl) => setBooking({ membership: m, template: tpl })}
                />
              ))}
            </div>
          </>
        ))}

      {tab === 'reservations' &&
        (reservations.length === 0 ? (
          <EmptyState icon="calendar" title={t('reservation.empty')} />
        ) : (
          <div className="space-y-3">
            {reservations.map((r) => (
              <ReservationCard key={r.id} reservation={r} />
            ))}
          </div>
        ))}

      {tab === 'orders' &&
        (orders.length === 0 ? (
          <EmptyState icon="tag" title={t('order.empty')} />
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
            <SettlementSummary orders={orders} t={t} lang={lang} />
          </div>
        ))}

      <BookingRequestModal
        open={!!booking}
        onClose={() => setBooking(null)}
        membership={booking?.membership}
        template={booking?.template}
      />
    </div>
  )
}

function Stat({ label, value, icon, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-500',
    brand: 'bg-brand-50 text-brand-600',
    amber: 'bg-amber-50 text-amber-600',
  }
  return (
    <div className="card flex items-center gap-3 p-3">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon name={icon} size={18} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-lg font-extrabold leading-tight text-slate-900">{value}</p>
        <p className="truncate text-[11px] text-slate-500">{label}</p>
      </div>
    </div>
  )
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
        active ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500'
      }`}
    >
      {children}
    </button>
  )
}

// Internal/demo view of StayEasy's commission revenue. Payment itself is
// collected by the hotel brand; this only reflects the BM economics.
function SettlementSummary({ orders, t, lang }) {
  const earned = orders.filter((o) => o.status === 'paid' || o.status === 'activated')
  if (earned.length === 0) return null

  // Totals per currency (orders may span VND/USD/KRW).
  const byCurrency = {}
  earned.forEach((o) => {
    const c = (byCurrency[o.currency] ||= { gmv: 0, commission: 0 })
    c.gmv += o.paidAmount || 0
    c.commission += o.commissionAmount || 0
  })

  return (
    <div className="mt-2 rounded-xl2 border border-dashed border-brand-300 bg-brand-50/50 p-4">
      <div className="flex items-center gap-2">
        <Icon name="sparkles" size={16} className="text-brand-600" />
        <p className="text-sm font-bold text-brand-800">{t('order.internalTitle')}</p>
      </div>
      <div className="mt-3 space-y-2">
        {Object.entries(byCurrency).map(([currency, v]) => (
          <div key={currency} className="flex items-center justify-between text-sm">
            <span className="text-slate-500">
              {t('order.gmv')}: <span className="font-semibold text-slate-700">{formatMoney(v.gmv, currency, lang)}</span>
            </span>
            <span className="font-bold text-brand-700">
              {t('order.commission')}: {formatMoney(v.commission, currency, lang)}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">{t('order.internalNote')}</p>
    </div>
  )
}

function CatPill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
        active ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {children}
    </button>
  )
}
