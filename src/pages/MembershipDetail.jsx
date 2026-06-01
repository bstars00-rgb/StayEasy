import { useParams, useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useTranslation } from '../i18n/useTranslation.js'
import { useState } from 'react'
import { getMembership, getPricing, isPaid } from '../data/memberships.js'
import { getVoucherPack } from '../data/voucherPacks.js'
import { formatMoney, formatDate } from '../utils/format.js'
import PurchaseModal from '../components/PurchaseModal.jsx'
import VoucherDetailModal from '../components/VoucherDetailModal.jsx'
import { gradient } from '../components/brandTheme.js'
import { BrandAvatar, Chip, ScoreBar } from '../components/ui.jsx'
import ScoreBadge from '../components/ScoreBadge.jsx'
import CTAButton from '../components/CTAButton.jsx'
import Icon from '../components/Icon.jsx'

const PACK_ICON = { dining: 'utensils', room: 'bed', spa: 'flower', discount: 'tag', gift: 'gift', other: 'dots' }

export default function MembershipDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, lang } = useTranslation()
  const { isSaved, addSaved, showToast, inCompare, toggleCompare, orders } = useApp()
  const { requireAuth } = useAuth()
  const [purchaseOpen, setPurchaseOpen] = useState(false)
  const [voucherDetail, setVoucherDetail] = useState(null)

  const m = getMembership(id)
  if (!m) {
    return (
      <div className="page-pad">
        <p className="text-slate-500">{t('detail.notFound')}</p>
        <Link to="/explore" className="btn-secondary mt-4 inline-flex">
          {t('myBenefits.exploreCta')}
        </Link>
      </div>
    )
  }

  const saved = isSaved(m.id)
  const comparing = inCompare(m.id)
  const free = m.annualFee === 0
  const paid = isPaid(m)
  const worthwhile = m.estimatedSavings > m.annualFee
  const pack = getVoucherPack(m.id)
  const pricing = getPricing(m)
  // An in-progress order for this membership (not cancelled/activated).
  const activeOrder = orders.find(
    (o) => o.membershipId === m.id && o.status !== 'cancelled' && o.status !== 'activated'
  )

  const discountLabel = (v) => (v == null ? t('common.memberRate') : `${t('common.upTo')} ${v}%`)
  const yesNo = (b) => (b ? t('detail.included') : t('detail.notIncluded'))

  function joinFree() {
    requireAuth(() => {
      addSaved(m)
      showToast(t('common.savedToast'))
    })
  }

  // Primary action depends on price + ownership + order state.
  let cta
  if (saved) {
    cta = { variant: 'secondary', icon: 'check', label: t('purchase.owned'), onClick: () => navigate('/my-benefits') }
  } else if (paid && activeOrder) {
    cta = { variant: 'secondary', icon: 'clock', label: t('purchase.inProgress'), onClick: () => navigate('/my-benefits') }
  } else if (paid) {
    cta = {
      variant: 'primary',
      icon: 'tag',
      label: `${t('purchase.buy')} · ${formatMoney(pricing.paidAmount, pricing.currency, lang)}`,
      onClick: () => requireAuth(() => setPurchaseOpen(true)),
    }
  } else {
    cta = { variant: 'primary', icon: 'plus', label: t('purchase.joinFree'), onClick: joinFree }
  }

  const stats = [
    { label: t('detail.diningDiscount'), value: discountLabel(m.diningDiscount), on: m.diningDiscount != null },
    { label: t('detail.roomDiscount'), value: discountLabel(m.roomDiscount), on: m.roomDiscount != null },
    { label: t('detail.freeNight'), value: yesNo(m.freeNight), on: m.freeNight },
    { label: t('detail.spaBenefit'), value: yesNo(m.spaBenefit), on: m.spaBenefit },
  ]

  return (
    <div className="pb-36">
      {/* 1. Header */}
      <div className="px-4 pb-6 pt-4 text-white" style={{ background: gradient(m.brand) }}>
        <button
          onClick={() => navigate(-1)}
          className="mb-3 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-sm font-semibold"
        >
          <Icon name="chevronLeft" size={16} />
          {t('common.back')}
        </button>
        <div className="flex items-center gap-3">
          <BrandAvatar membership={m} size={56} className="ring-2 ring-white/40" />
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold leading-tight">{m.name}</h1>
            <p className="mt-0.5 text-sm text-white/85">
              {m.brand} · {t(`countries.${m.country}`)}
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {m.cities.map((c) => (
            <Chip key={c} tone="white">
              <Icon name="pin" size={12} /> {t(`cities.${c}`)}
            </Chip>
          ))}
        </div>
      </div>

      {/* Score strip */}
      <div className="-mt-4 px-4">
        <div className="card flex items-center justify-between p-4">
          <div>
            <p className="text-xs text-slate-400">{t('common.recommendationScore')}</p>
            <p className="text-2xl font-extrabold text-slate-900">{m.scores.overall}</p>
          </div>
          <ScoreBadge score={m.scores.overall} className="!px-3 !py-1.5 !text-sm" />
        </div>
      </div>

      <div className="page-pad space-y-7 pt-6">
        {/* 2. Key Benefits */}
        <section>
          <h2 className="mb-3 text-base font-bold text-slate-900">{t('detail.keyBenefits')}</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {stats.map((s) => (
              <div key={s.label} className="card p-3">
                <p className="text-xs text-slate-400">{s.label}</p>
                <p className={`mt-1 font-bold ${s.on ? 'text-slate-900' : 'text-slate-400'}`}>{s.value}</p>
              </div>
            ))}
            <div className="card col-span-2 flex items-center justify-between bg-brand-50 p-3">
              <p className="text-sm font-semibold text-brand-700">{t('common.estimatedSavings')}</p>
              <p className="text-lg font-extrabold text-brand-700">
                {formatMoney(m.estimatedSavings, m.currency, lang)}
              </p>
            </div>
          </div>
          <ul className="mt-3 space-y-2">
            {m.benefits.map((b) => (
              <li key={b} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-500">
                  <Icon name="check" size={14} />
                </span>
                <span className="text-sm text-slate-700">{b}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Voucher pack preview */}
        {pack.length > 0 && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">{t('voucher.packPreview')}</h2>
              <span className="text-xs font-semibold text-slate-400">
                {t('voucher.totalVouchers', { count: pack.reduce((s, v) => s + v.quantity, 0) })}
              </span>
            </div>
            <ul className="space-y-2">
              {pack.map((v) => (
                <li key={v.templateId}>
                  <button
                    onClick={() => setVoucherDetail(v)}
                    className="card flex w-full items-center gap-3 p-3 text-left transition hover:shadow-cardhover"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <Icon name={PACK_ICON[v.category] || 'ticket'} size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{v.title}</p>
                      <p className="text-xs text-slate-400">
                        {t(`voucherCat.${v.category}`)} · {formatDate(v.validUntil, lang)}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">×{v.quantity}</span>
                    <Icon name="chevronRight" size={16} className="text-slate-300" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 3. Participating Hotels */}
        <section>
          <h2 className="mb-3 text-base font-bold text-slate-900">{t('detail.participatingHotels')}</h2>
          <ul className="space-y-2">
            {m.hotels.map((h) => (
              <li key={h} className="card flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-700">
                <Icon name="pin" size={16} className="text-brand-500" />
                {h}
              </li>
            ))}
          </ul>
        </section>

        {/* 4. Best For */}
        <section>
          <h2 className="mb-3 text-base font-bold text-slate-900">{t('common.bestFor')}</h2>
          <div className="flex flex-wrap gap-2">
            {m.bestFor.map((tag) => (
              <Chip key={tag}>{t(`tags.${tag}`)}</Chip>
            ))}
          </div>
        </section>

        {/* Scores */}
        <section className="card space-y-3 p-4">
          <ScoreBar label={t('scores.familyDining')} value={m.scores.familyDining} />
          <ScoreBar label={t('scores.staycation')} value={m.scores.staycation} />
          <ScoreBar label={t('scores.businessTravel')} value={m.scores.businessTravel} />
          <ScoreBar label={t('scores.easeOfUse')} value={m.scores.easeOfUse} />
        </section>

        {/* 5. Important Notes */}
        <section>
          <h2 className="mb-3 text-base font-bold text-slate-900">{t('detail.importantNotes')}</h2>
          <div className="card space-y-2 p-4 text-sm text-slate-600">
            {[1, 2, 3, 4].map((n) => (
              <p key={n} className="flex gap-2">
                <span className="text-slate-300">•</span>
                {t(`detail.note${n}`)}
              </p>
            ))}
            {m.notes && (
              <p className="mt-2 rounded-xl bg-amber-50 p-3 text-amber-800">
                <span className="font-semibold">{t('detail.programNote')}: </span>
                {m.notes}
              </p>
            )}
          </div>
        </section>

        {/* 6. Value Summary */}
        <section>
          <h2 className="mb-3 text-base font-bold text-slate-900">{t('detail.valueSummary')}</h2>
          <div className="card p-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm text-slate-500">{t('common.annualFee')}</span>
              <span className="font-bold text-slate-900">
                {free ? <span className="text-emerald-600">{t('common.free')}</span> : formatMoney(m.annualFee, m.currency, lang)}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-slate-500">{t('common.estimatedSavings')}</span>
              <span className="font-bold text-brand-600">{formatMoney(m.estimatedSavings, m.currency, lang)}</span>
            </div>
            <p
              className={`rounded-xl p-3 text-sm font-medium ${
                worthwhile ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}
            >
              {worthwhile ? t('detail.roiGood') : t('detail.roiLimited')}
            </p>
          </div>
        </section>

        {/* 7. Secondary actions */}
        <div className="grid grid-cols-2 gap-2">
          <CTAButton variant={comparing ? 'primary' : 'ghost'} icon={comparing ? 'check' : 'compare'} onClick={() => toggleCompare(m.id)}>
            {t('common.compare')}
          </CTAButton>
          <CTAButton variant="ghost" icon="help" onClick={() => navigate(`/help?membership=${m.id}`)}>
            {t('common.requestAssistance')}
          </CTAButton>
          <CTAButton
            variant="outline"
            icon="globe"
            className="col-span-2"
            onClick={() => window.open(m.officialUrl, '_blank', 'noopener')}
          >
            {t('common.officialWebsite')}
          </CTAButton>
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-[60px] z-30 mx-auto max-w-md border-t border-slate-100 bg-white/95 p-3 backdrop-blur">
        <CTAButton fullWidth size="lg" variant={cta.variant} icon={cta.icon} onClick={cta.onClick}>
          {cta.label}
        </CTAButton>
      </div>

      <PurchaseModal open={purchaseOpen} onClose={() => setPurchaseOpen(false)} membership={m} />
      <VoucherDetailModal
        open={!!voucherDetail}
        onClose={() => setVoucherDetail(null)}
        membership={m}
        template={voucherDetail}
      />
    </div>
  )
}
