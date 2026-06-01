import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { useTranslation } from '../i18n/useTranslation.js'
import { whatsappLink, mailtoLink } from '../data/contact.js'
import { Modal } from './ui.jsx'
import CTAButton from './CTAButton.jsx'
import Icon from './Icon.jsx'

// Booking request flow: collect date/guests/hotel/note for a voucher,
// record the reservation, and hand off to WhatsApp/Email.
export default function BookingRequestModal({ open, onClose, membership, template }) {
  const { t } = useTranslation()
  const { city, createReservation, showToast } = useApp()
  const [date, setDate] = useState('')
  const [guests, setGuests] = useState('2')
  const [hotel, setHotel] = useState('')
  const [note, setNote] = useState('')

  const hotels = template?.hotels?.length ? template.hotels : []

  // Reset when a new voucher opens.
  useEffect(() => {
    if (open) {
      setDate('')
      setGuests('2')
      setHotel(hotels[0] || '')
      setNote('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, template?.templateId])

  if (!template) return null

  function record() {
    return createReservation({
      membershipId: membership.id,
      templateId: template.templateId,
      title: template.title,
      date,
      guests,
      hotel: hotel || t('voucher.anyHotel'),
      note,
    })
  }

  function buildMessage() {
    return [
      'Hello StayEasy,',
      'I would like to use a membership voucher.',
      '',
      `Membership: ${membership.name}`,
      `Voucher: ${template.title}`,
      `City: ${t(`cities.${city}`)}`,
      `Hotel: ${hotel || t('voucher.anyHotel')}`,
      `Date: ${date || '-'}`,
      `Guests: ${guests || '-'}`,
      `Note: ${note || '-'}`,
    ].join('\n')
  }

  function createOnly() {
    record()
    showToast(t('reservation.statusRequested'))
    onClose()
  }

  function sendWhatsApp() {
    record()
    window.open(whatsappLink(buildMessage()), '_blank', 'noopener')
    showToast(t('reservation.statusRequested'))
    onClose()
  }

  function sendEmail() {
    record()
    window.location.href = mailtoLink(`StayEasy booking — ${template.title}`, buildMessage())
    showToast(t('reservation.statusRequested'))
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={t('reservation.new')}>
      <p className="mb-3 rounded-xl bg-brand-50 p-3 text-xs text-brand-800">{t('reservation.howItWorks')}</p>
      <p className="mb-3 text-sm font-semibold text-slate-700">{t('reservation.forVoucher', { title: template.title })}</p>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('reservation.date')}>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" />
          </Field>
          <Field label={t('reservation.guests')}>
            <input type="number" min="1" value={guests} onChange={(e) => setGuests(e.target.value)} className="input" />
          </Field>
        </div>
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
