import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { useTranslation } from '../i18n/useTranslation.js'
import { Modal } from './ui.jsx'
import CTAButton from './CTAButton.jsx'

// Gift (transfer) one unit of a transferable voucher to someone else.
// Records the transfer, which reduces the voucher's availability.
export default function TransferModal({ open, onClose, membership, template }) {
  const { t } = useTranslation()
  const { createTransfer, showToast } = useApp()
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (open) {
      setName('')
      setContact('')
      setMessage('')
    }
  }, [open, template?.templateId])

  if (!template) return null

  function submit(e) {
    e.preventDefault()
    if (!name.trim()) return
    createTransfer({
      membershipId: membership.id,
      templateId: template.templateId,
      title: template.title,
      recipientName: name.trim(),
      recipientContact: contact.trim(),
      message: message.trim(),
    })
    showToast(t('transfer.done'))
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={t('transfer.title')}>
      <p className="mb-1 text-sm font-semibold text-slate-700">{template.title}</p>
      <p className="mb-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">{t('transfer.note')}</p>
      <form onSubmit={submit} className="space-y-3">
        <Field label={t('transfer.recipient')}>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input" required />
        </Field>
        <Field label={`${t('transfer.contact')} (${t('common.optional')})`}>
          <input value={contact} onChange={(e) => setContact(e.target.value)} className="input" />
        </Field>
        <Field label={t('transfer.message')}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('transfer.messagePlaceholder')}
            rows={2}
            className="input resize-none"
          />
        </Field>
        <CTAButton type="submit" variant="primary" fullWidth icon="gift">
          {t('transfer.submit')}
        </CTAButton>
      </form>
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
