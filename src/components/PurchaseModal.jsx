import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { useTranslation } from '../i18n/useTranslation.js'
import { getPricing } from '../data/memberships.js'
import { formatMoney } from '../utils/format.js'
import { whatsappLink, mailtoLink } from '../data/contact.js'
import { Modal } from './ui.jsx'
import CTAButton from './CTAButton.jsx'
import Icon from './Icon.jsx'

// Purchase request flow. StayEasy records the order; actual payment is made
// to the hotel brand via their invoice. Vouchers are issued once the order
// is activated (see AppContext.setOrderStatus).
export default function PurchaseModal({ open, onClose, membership }) {
  const { t, lang } = useTranslation()
  const { city, createOrder, showToast } = useApp()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    if (open) {
      setName('')
      setEmail('')
      setPhone('')
    }
  }, [open, membership?.id])

  if (!membership) return null
  const pricing = getPricing(membership)

  function record() {
    return createOrder({
      membershipId: membership.id,
      buyerName: name.trim(),
      buyerEmail: email.trim(),
      buyerPhone: phone.trim(),
      city,
      listPrice: pricing.listPrice,
      salePrice: pricing.salePrice,
      paidAmount: pricing.paidAmount,
      currency: pricing.currency,
      commissionRate: pricing.commissionRate,
      commissionAmount: pricing.commissionAmount,
    })
  }

  function buildMessage() {
    return [
      'Hello StayEasy,',
      'I would like to purchase a hotel membership.',
      '',
      `Membership: ${membership.name}`,
      `Price: ${formatMoney(pricing.paidAmount, pricing.currency, lang)}`,
      `City: ${t(`cities.${city}`)}`,
      `Name: ${name || '-'}`,
      `Email: ${email || '-'}`,
      `Phone: ${phone || '-'}`,
    ].join('\n')
  }

  function submit() {
    record()
    showToast(t('purchase.requested'))
    onClose()
  }

  function submitVia(kind) {
    record()
    const msg = buildMessage()
    if (kind === 'whatsapp') window.open(whatsappLink(msg), '_blank', 'noopener')
    else window.location.href = mailtoLink(`StayEasy purchase — ${membership.name}`, msg)
    showToast(t('purchase.requested'))
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={t('purchase.title')}>
      <p className="font-bold text-slate-900">{membership.name}</p>
      <p className="text-xs text-slate-500">{membership.brand}</p>

      {/* Price */}
      <div className="mt-3 rounded-2xl bg-slate-50 p-4">
        {pricing.salePrice != null && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">{t('purchase.listPrice')}</span>
            <span className="text-slate-400 line-through">{formatMoney(pricing.listPrice, pricing.currency, lang)}</span>
          </div>
        )}
        <div className="mt-1 flex items-center justify-between">
          <span className="font-semibold text-slate-700">{t('purchase.youPay')}</span>
          <span className="text-xl font-extrabold text-brand-600">{formatMoney(pricing.paidAmount, pricing.currency, lang)}</span>
        </div>
      </div>

      {/* Payment notice */}
      <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
        <Icon name="tag" size={16} className="mt-0.5 shrink-0 text-amber-600" />
        {t('purchase.paymentNotice')}
      </div>

      {/* Buyer details */}
      <p className="mt-4 mb-2 text-sm font-semibold text-slate-700">{t('purchase.buyerInfo')}</p>
      <div className="space-y-2.5">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('assistance.name')} className="input" />
        <div className="grid grid-cols-2 gap-2.5">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('assistance.email')} className="input" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('assistance.phone')} className="input" />
        </div>
      </div>

      <CTAButton variant="primary" fullWidth className="mt-4" icon="check" onClick={submit}>
        {t('purchase.submit')}
      </CTAButton>
      <p className="mt-3 mb-2 text-xs font-semibold text-slate-500">{t('reservation.sendVia')}</p>
      <div className="grid grid-cols-2 gap-2">
        <CTAButton variant="whatsapp" icon="whatsapp" onClick={() => submitVia('whatsapp')}>
          WhatsApp
        </CTAButton>
        <CTAButton variant="secondary" icon="mail" onClick={() => submitVia('email')}>
          Email
        </CTAButton>
      </div>
    </Modal>
  )
}
