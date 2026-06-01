import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { useTranslation } from '../i18n/useTranslation.js'
import { getMembership, memberships } from '../data/memberships.js'
import { formatMoney, daysUntil } from '../utils/format.js'
import { BrandAvatar } from '../components/ui.jsx'
import BenefitCard from '../components/BenefitCard.jsx'
import EmptyState from '../components/EmptyState.jsx'
import CTAButton from '../components/CTAButton.jsx'
import Icon from '../components/Icon.jsx'

const BENEFIT_TYPES = ['freeNight', 'diningDiscount', 'buffetVoucher', 'roomDiscount', 'spaBenefit', 'barLounge', 'other']
const CURRENCIES = ['VND', 'USD', 'KRW', 'THB', 'JPY']

const emptyForm = {
  membershipName: '',
  title: '',
  type: 'diningDiscount',
  expiry: '',
  value: '',
  currency: 'VND',
  status: 'unused',
  notes: '',
}

export default function MyBenefits() {
  const navigate = useNavigate()
  const { t, lang } = useTranslation()
  const { savedIds, removeSaved, benefits, addBenefit, deleteBenefit, markBenefitUsed, showToast } = useApp()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const savedMemberships = savedIds.map(getMembership).filter(Boolean)

  // Summary metrics.
  const activeBenefits = benefits.filter((b) => b.status !== 'used')
  const currencies = new Set(activeBenefits.filter((b) => b.value).map((b) => b.currency))
  const totalValueNum = activeBenefits.reduce((sum, b) => sum + (Number(b.value) || 0), 0)
  const totalValueLabel =
    currencies.size === 1 ? formatMoney(totalValueNum, [...currencies][0], lang) : totalValueNum.toLocaleString()
  const expiringSoon = activeBenefits.filter((b) => {
    const d = daysUntil(b.expiry)
    return d != null && d >= 0 && d <= 30
  }).length

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function submit(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.expiry) {
      showToast(t('form.required'))
      return
    }
    addBenefit({
      membershipName: form.membershipName.trim(),
      title: form.title.trim(),
      type: form.type,
      expiry: form.expiry,
      value: form.value ? Number(form.value) : null,
      currency: form.currency,
      status: form.status,
      notes: form.notes.trim(),
    })
    setForm(emptyForm)
    setShowForm(false)
    showToast(t('common.savedToast'))
  }

  return (
    <div className="page-pad space-y-6">
      <h1 className="text-xl font-extrabold text-slate-900">{t('myBenefits.title')}</h1>

      {/* 1. Summary */}
      <section className="grid grid-cols-2 gap-2.5">
        <Stat label={t('myBenefits.totalMemberships')} value={savedMemberships.length} icon="bookmark" />
        <Stat label={t('myBenefits.totalBenefits')} value={benefits.length} icon="ticket" />
        <Stat label={t('myBenefits.totalValue')} value={totalValueLabel} icon="sparkles" tone="brand" />
        <Stat label={t('myBenefits.expiringSoon')} value={expiringSoon} icon="clock" tone={expiringSoon > 0 ? 'amber' : 'slate'} />
      </section>

      {/* 2. Saved memberships */}
      <section>
        <h2 className="mb-3 text-base font-bold text-slate-900">{t('myBenefits.savedMemberships')}</h2>
        {savedMemberships.length === 0 ? (
          <EmptyState icon="bookmark" title={t('myBenefits.noSavedMemberships')}>
            <CTAButton variant="primary" onClick={() => navigate('/explore')}>
              {t('myBenefits.exploreCta')}
            </CTAButton>
          </EmptyState>
        ) : (
          <div className="space-y-2.5">
            {savedMemberships.map((m) => (
              <div key={m.id} className="card flex items-center gap-3 p-3">
                <BrandAvatar membership={m} size={44} />
                <button onClick={() => navigate(`/membership/${m.id}`)} className="min-w-0 flex-1 text-left">
                  <p className="truncate font-bold text-slate-900">{m.name}</p>
                  <p className="truncate text-xs text-slate-500">
                    {m.brand} · {m.cities.map((c) => t(`cities.${c}`)).join(', ')}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-brand-600">
                    {m.annualFee === 0 ? t('common.free') : formatMoney(m.annualFee, m.currency, lang)}
                  </p>
                </button>
                <button
                  onClick={() => removeSaved(m.id)}
                  className="rounded-full p-2 text-slate-300 hover:text-rose-500"
                  aria-label={t('common.delete')}
                >
                  <Icon name="trash" size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Add benefit / voucher */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">{t('myBenefits.benefitList')}</h2>
          <CTAButton variant={showForm ? 'ghost' : 'primary'} icon={showForm ? 'close' : 'plus'} onClick={() => setShowForm((s) => !s)}>
            {t('myBenefits.addBenefit')}
          </CTAButton>
        </div>

        {showForm && (
          <form onSubmit={submit} className="card mb-4 space-y-3 p-4">
            <Field label={`${t('form.membershipName')} (${t('common.optional')})`}>
              <input
                list="membership-names"
                value={form.membershipName}
                onChange={(e) => update('membershipName', e.target.value)}
                placeholder={t('form.placeholderMembership')}
                className="input"
              />
              <datalist id="membership-names">
                {memberships.map((m) => (
                  <option key={m.id} value={m.name} />
                ))}
              </datalist>
            </Field>
            <Field label={t('form.benefitTitle')}>
              <input
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder={t('form.placeholderBenefitTitle')}
                className="input"
                required
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('form.benefitType')}>
                <select value={form.type} onChange={(e) => update('type', e.target.value)} className="input">
                  {BENEFIT_TYPES.map((bt) => (
                    <option key={bt} value={bt}>
                      {t(`form.type_${bt}`)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t('form.expiryDate')}>
                <input type="date" value={form.expiry} onChange={(e) => update('expiry', e.target.value)} className="input" required />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label={`${t('form.estimatedValue')} (${t('common.optional')})`}>
                <input
                  type="number"
                  min="0"
                  value={form.value}
                  onChange={(e) => update('value', e.target.value)}
                  className="input"
                />
              </Field>
              <Field label={t('form.currency')}>
                <select value={form.currency} onChange={(e) => update('currency', e.target.value)} className="input">
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label={t('form.status')}>
              <select value={form.status} onChange={(e) => update('status', e.target.value)} className="input">
                <option value="unused">{t('status.unused')}</option>
                <option value="used">{t('status.used')}</option>
              </select>
            </Field>
            <Field label={`${t('form.notes')} (${t('common.optional')})`}>
              <textarea
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
                placeholder={t('form.placeholderNotes')}
                rows={2}
                className="input resize-none"
              />
            </Field>
            <div className="flex gap-2">
              <CTAButton type="submit" variant="primary" fullWidth>
                {t('form.saveBenefit')}
              </CTAButton>
              <CTAButton type="button" variant="ghost" onClick={() => setForm(emptyForm)}>
                {t('form.clearForm')}
              </CTAButton>
            </div>
          </form>
        )}

        {/* 4. Benefit list */}
        {benefits.length === 0 ? (
          <EmptyState icon="ticket" title={t('myBenefits.empty')} />
        ) : (
          <div className="space-y-2.5">
            {benefits
              .slice()
              .sort((a, b) => (daysUntil(a.expiry) ?? 1e9) - (daysUntil(b.expiry) ?? 1e9))
              .map((b) => (
                <BenefitCard key={b.id} benefit={b} onMarkUsed={markBenefitUsed} onDelete={deleteBenefit} />
              ))}
          </div>
        )}
      </section>
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

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  )
}
