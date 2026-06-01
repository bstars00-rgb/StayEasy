import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { useTranslation } from '../i18n/useTranslation.js'
import { memberships, getMembership } from '../data/memberships.js'
import { cities } from '../data/cities.js'
import CTAButton from '../components/CTAButton.jsx'
import Icon from '../components/Icon.jsx'

// Placeholder contacts — swap for real values (or a backend) later.
const WHATSAPP_NUMBER = '84900000000' // international format, no '+'
const SUPPORT_EMAIL = 'hello@stayeasy.app'
const DRAFT_KEY = 'stayeasy.assistDraft'

const REQUEST_TYPES = [
  { value: 'dining', labelKey: 'assistance.typeDining' },
  { value: 'freeNight', labelKey: 'assistance.typeFreeNight' },
  { value: 'recommendation', labelKey: 'assistance.typeRecommendation' },
  { value: 'benefitCheck', labelKey: 'assistance.typeBenefitCheck' },
  { value: 'other', labelKey: 'assistance.typeOther' },
]

function loadDraft() {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function RequestAssistance() {
  const { t } = useTranslation()
  const { city } = useApp()
  const [params] = useSearchParams()
  const preMembership = getMembership(params.get('membership'))

  const [form, setForm] = useState(() => ({
    name: '',
    email: '',
    phone: '',
    city,
    membership: preMembership?.name || '',
    date: '',
    guests: '',
    type: 'dining',
    message: '',
    ...(loadDraft() || {}),
  }))
  const [error, setError] = useState('')

  // Persist a draft so a half-filled request survives a reload.
  useEffect(() => {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(form))
    } catch {
      /* ignore */
    }
  }, [form])

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function buildMessage() {
    const typeLabel = t(REQUEST_TYPES.find((x) => x.value === form.type).labelKey)
    const cityLabel = form.city ? t(`cities.${form.city}`) : ''
    return [
      t('assistance.messageIntro'),
      '',
      `${t('assistance.name')}: ${form.name}`,
      `${t('assistance.city')}: ${cityLabel}`,
      `${t('assistance.membership')}: ${form.membership || '-'}`,
      `${t('assistance.desiredDate')}: ${form.date || '-'}`,
      `${t('assistance.guests')}: ${form.guests || '-'}`,
      `${t('assistance.requestType')}: ${typeLabel}`,
      `${t('assistance.message')}: ${form.message || '-'}`,
    ].join('\n')
  }

  function validate() {
    if (!form.name.trim()) {
      setError(t('assistance.fillName'))
      return false
    }
    setError('')
    return true
  }

  function sendWhatsApp() {
    if (!validate()) return
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildMessage())}`, '_blank', 'noopener')
  }

  function sendEmail() {
    if (!validate()) return
    const subject = `StayEasy — ${t(REQUEST_TYPES.find((x) => x.value === form.type).labelKey)}`
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildMessage())}`
  }

  return (
    <div className="page-pad space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">{t('assistance.title')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('assistance.subtitle')}</p>
      </div>

      <div className="flex items-start gap-2 rounded-2xl bg-brand-50 p-3 text-sm text-brand-800">
        <Icon name="sparkles" size={18} className="mt-0.5 shrink-0 text-brand-500" />
        {t('assistance.helper')}
      </div>

      <div className="grid grid-cols-1 gap-3">
        <Field label={t('assistance.name')}>
          <input value={form.name} onChange={(e) => update('name', e.target.value)} className="input" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={`${t('assistance.email')} (${t('common.optional')})`}>
            <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="input" />
          </Field>
          <Field label={`${t('assistance.phone')} (${t('common.optional')})`}>
            <input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="input" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('assistance.city')}>
            <select value={form.city} onChange={(e) => update('city', e.target.value)} className="input">
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {t(`cities.${c.id}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('assistance.requestType')}>
            <select value={form.type} onChange={(e) => update('type', e.target.value)} className="input">
              {REQUEST_TYPES.map((x) => (
                <option key={x.value} value={x.value}>
                  {t(x.labelKey)}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label={`${t('assistance.membership')} (${t('common.optional')})`}>
          <select value={form.membership} onChange={(e) => update('membership', e.target.value)} className="input">
            <option value="">{t('common.none')}</option>
            {memberships.map((m) => (
              <option key={m.id} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={`${t('assistance.desiredDate')} (${t('common.optional')})`}>
            <input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} className="input" />
          </Field>
          <Field label={`${t('assistance.guests')} (${t('common.optional')})`}>
            <input type="number" min="1" value={form.guests} onChange={(e) => update('guests', e.target.value)} className="input" />
          </Field>
        </div>
        <Field label={t('assistance.message')}>
          <textarea value={form.message} onChange={(e) => update('message', e.target.value)} rows={4} className="input resize-none" />
        </Field>
      </div>

      {error && <p className="text-sm font-medium text-rose-500">{error}</p>}

      <div className="space-y-2">
        <CTAButton variant="whatsapp" fullWidth icon="whatsapp" onClick={sendWhatsApp}>
          {t('assistance.sendWhatsApp')}
        </CTAButton>
        <CTAButton variant="secondary" fullWidth icon="mail" onClick={sendEmail}>
          {t('assistance.sendEmail')}
        </CTAButton>
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
