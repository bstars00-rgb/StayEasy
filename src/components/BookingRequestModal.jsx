import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { useTranslation } from '../i18n/useTranslation.js'
import { whatsappLink, mailtoLink } from '../data/contact.js'
import { childPolicyHints } from '../utils/childPolicy.js'
import { localizeVoucher } from '../data/voucherI18n.js'
import { Modal } from './ui.jsx'
import CTAButton from './CTAButton.jsx'
import Icon from './Icon.jsx'

const MAX_PER_TYPE = 8 // max adults / max children
const CHILD_AGE_MAX = 17 // age dropdown: 0 (under 1) .. 17
const DEFAULT_CHILD_AGE = 6

// Booking request flow: collect date, party (adults + children with ages),
// hotel and notes for a voucher, record the reservation, and hand off to
// WhatsApp/Email.
export default function BookingRequestModal({ open, onClose, membership, template }) {
  const { t, lang } = useTranslation()
  const { city, createReservation, showToast } = useApp()
  const [date, setDate] = useState('')
  const [adults, setAdults] = useState(2)
  const [childAges, setChildAges] = useState([]) // one entry per child
  const [hotel, setHotel] = useState('')
  const [note, setNote] = useState('')

  const hotels = template?.hotels?.length ? template.hotels : []

  // Reset when a new voucher opens.
  useEffect(() => {
    if (open) {
      setDate('')
      setAdults(2)
      setChildAges([])
      setHotel(hotels[0] || '')
      setNote('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, template?.templateId])

  if (!template) return null

  const children = childAges.length

  // Grow/shrink the per-child age list when the children count changes.
  function setChildrenCount(value) {
    const n = Math.max(0, Math.min(MAX_PER_TYPE, parseInt(value, 10) || 0))
    setChildAges((prev) => {
      const next = prev.slice(0, n)
      while (next.length < n) next.push(DEFAULT_CHILD_AGE)
      return next
    })
  }

  function setChildAge(index, age) {
    setChildAges((prev) => prev.map((a, i) => (i === index ? Number(age) : a)))
  }

  function ageLabel(age) {
    return age === 0 ? t('reservation.ageUnder1') : `${age} ${t('reservation.years')}`
  }

  function record() {
    return createReservation({
      membershipId: membership.id,
      templateId: template.templateId,
      title: template.title,
      date,
      adults: Number(adults) || 0,
      children,
      childAges,
      guests: (Number(adults) || 0) + children,
      hotel: hotel || t('voucher.anyHotel'),
      note,
    })
  }

  function buildMessage() {
    const childLine =
      children > 0
        ? `${t('reservation.children')}: ${children} (${childAges.map(ageLabel).join(', ')})`
        : `${t('reservation.children')}: 0`
    return [
      'Hello StayEasy,',
      'I would like to use a membership voucher.',
      '',
      `Membership: ${membership.name}`,
      `Voucher: ${template.title}`,
      `City: ${t(`cities.${city}`)}`,
      `Hotel: ${hotel || t('voucher.anyHotel')}`,
      `Date: ${date || '-'}`,
      `${t('reservation.adults')}: ${adults}`,
      childLine,
      `Note: ${note || '-'}`,
    ].join('\n')
  }

  function finish() {
    showToast(t('reservation.statusRequested'))
    onClose()
  }

  function createOnly() {
    record()
    finish()
  }

  function sendWhatsApp() {
    record()
    window.open(whatsappLink(buildMessage()), '_blank', 'noopener')
    finish()
  }

  function sendEmail() {
    record()
    window.location.href = mailtoLink(`StayEasy booking — ${template.title}`, buildMessage())
    finish()
  }

  return (
    <Modal open={open} onClose={onClose} title={t('reservation.new')}>
      <p className="mb-3 rounded-xl bg-brand-50 p-3 text-xs text-brand-800">{t('reservation.howItWorks')}</p>
      <p className="mb-3 text-sm font-semibold text-slate-700">{t('reservation.forVoucher', { title: localizeVoucher(template, lang).title })}</p>

      <div className="space-y-3">
        <Field label={t('reservation.date')}>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" />
        </Field>

        {/* Party: adults + children */}
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('reservation.adults')}>
            <input
              type="number"
              min="1"
              max={MAX_PER_TYPE}
              value={adults}
              onChange={(e) => setAdults(Math.max(1, Math.min(MAX_PER_TYPE, parseInt(e.target.value, 10) || 1)))}
              className="input"
            />
          </Field>
          <Field label={t('reservation.children')}>
            <input
              type="number"
              min="0"
              max={MAX_PER_TYPE}
              value={children}
              onChange={(e) => setChildrenCount(e.target.value)}
              className="input"
            />
          </Field>
        </div>

        {/* One age dropdown per child */}
        {children > 0 && (
          <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-3">
            {childAges.map((age, i) => (
              <Field key={i} label={t('reservation.childAge', { n: i + 1 })}>
                <select value={age} onChange={(e) => setChildAge(i, e.target.value)} className="input bg-white">
                  {Array.from({ length: CHILD_AGE_MAX + 1 }, (_, a) => (
                    <option key={a} value={a}>
                      {ageLabel(a)}
                    </option>
                  ))}
                </select>
              </Field>
            ))}
          </div>
        )}

        {/* Auto child-policy hints based on the children's ages + voucher type */}
        {(() => {
          const hints = children > 0 ? childPolicyHints(template.category, childAges) : []
          if (hints.length === 0) return null
          return (
            <div className="rounded-2xl border border-gold-100 bg-gold-50 p-3">
              <p className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-gold-700">
                <Icon name="sparkles" size={15} />
                {t('childPolicy.title')}
              </p>
              <ul className="space-y-1">
                {hints.map((h) => (
                  <li key={h.key} className="flex gap-2 text-sm text-slate-700">
                    <Icon name="check" size={15} className="mt-0.5 shrink-0 text-gold-600" />
                    {t(`childPolicy.${h.key}`, { count: h.count })}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] text-slate-500">{t('childPolicy.note')}</p>
            </div>
          )
        })()}

        <Field label={t('reservation.hotel')}>
          {hotels.length > 0 ? (
            <select value={hotel} onChange={(e) => setHotel(e.target.value)} className="input">
              {hotels.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          ) : (
            <input value={hotel} onChange={(e) => setHotel(e.target.value)} placeholder={t('voucher.anyHotel')} className="input" />
          )}
        </Field>

        <Field label={`${t('reservation.note')} (${t('common.optional')})`}>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('reservation.notePlaceholder')}
            rows={2}
            className="input resize-none"
          />
        </Field>
      </div>

      <CTAButton variant="primary" fullWidth className="mt-4" icon="check" onClick={createOnly}>
        {t('reservation.submit')}
      </CTAButton>

      <p className="mt-4 mb-2 text-xs font-semibold text-slate-500">{t('reservation.sendVia')}</p>
      <div className="grid grid-cols-2 gap-2">
        <CTAButton variant="whatsapp" icon="whatsapp" onClick={sendWhatsApp}>
          WhatsApp
        </CTAButton>
        <CTAButton variant="secondary" icon="mail" onClick={sendEmail}>
          Email
        </CTAButton>
      </div>
    </Modal>
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
