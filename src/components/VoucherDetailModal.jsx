import { useTranslation } from '../i18n/useTranslation.js'
import { formatDate } from '../utils/format.js'
import { voucherPhoto, categoryMeta } from '../data/media.js'
import { Modal, Chip } from './ui.jsx'
import Icon from './Icon.jsx'
import SmartImage from './SmartImage.jsx'

const CAT_ICON = { dining: 'utensils', room: 'bed', spa: 'flower', discount: 'tag', gift: 'gift', other: 'dots' }

// Detailed view of a single voucher: description, validity, eligible hotels,
// on-site conditions and standard terms. `stats` (optional) shows the user's
// own available/used counts when viewed from the wallet.
export default function VoucherDetailModal({ open, onClose, membership, template, stats }) {
  const { t, lang } = useTranslation()
  if (!template) return null

  return (
    <Modal open={open} onClose={onClose} title={template.title}>
      <SmartImage
        src={voucherPhoto(template)}
        alt={template.title}
        gradient={categoryMeta(template.category).grad}
        icon={CAT_ICON[template.category] || 'dots'}
        iconSize={36}
        rounded="rounded-2xl"
        className="mb-3 h-32 w-full"
      />
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Icon name={CAT_ICON[template.category] || 'dots'} size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-700">{membership?.name}</p>
          <p className="text-xs text-slate-400">{t(`voucherCat.${template.category}`)}</p>
        </div>
        <Chip tone="slate">
          {t(template.transferable ? 'voucher.transferable' : 'voucher.nonTransferable')}
        </Chip>
      </div>

      {/* Counts (wallet view) or total quantity (catalog view) */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Stat label={t('voucher.total')} value={template.quantity} />
        <Stat label={t('voucher.available')} value={stats ? stats.available : '—'} highlight={!!stats} />
        <Stat label={t('voucher.used')} value={stats ? stats.used : '—'} muted />
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-sm text-slate-500">
        <Icon name="clock" size={15} className="text-slate-400" />
        {t('status.expiresOn', { date: formatDate(template.validUntil, lang) })}
      </div>

      {template.description && (
        <section className="mt-4">
          <h4 className="mb-1 text-sm font-bold text-slate-900">{t('voucher.aboutThis')}</h4>
          <p className="text-sm leading-relaxed text-slate-600">{template.description}</p>
        </section>
      )}

      {template.hotels?.length > 0 && (
        <section className="mt-4">
          <h4 className="mb-1.5 text-sm font-bold text-slate-900">{t('voucher.eligibleHotels')}</h4>
          <ul className="space-y-1">
            {template.hotels.map((h) => (
              <li key={h} className="flex items-center gap-2 text-sm text-slate-600">
                <Icon name="pin" size={14} className="shrink-0 text-brand-500" />
                {h}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-4">
        <h4 className="mb-1.5 text-sm font-bold text-slate-900">{t('voucher.terms')}</h4>
        <ul className="space-y-1.5 text-sm text-slate-600">
          {template.note && (
            <li className="flex gap-2 rounded-xl bg-amber-50 p-2.5 text-amber-800">
              <Icon name="tag" size={15} className="mt-0.5 shrink-0 text-amber-600" />
              {template.note}
            </li>
          )}
          {[1, 2, 3, 4].map((n) => (
            <li key={n} className="flex gap-2">
              <span className="text-slate-300">•</span>
              {t(`voucher.term${n}`)}
            </li>
          ))}
        </ul>
      </section>
    </Modal>
  )
}

function Stat({ label, value, highlight, muted }) {
  return (
    <div className="rounded-xl bg-slate-50 py-2">
      <p className={`text-lg font-extrabold leading-none ${highlight ? 'text-brand-600' : muted ? 'text-slate-400' : 'text-slate-800'}`}>
        {value}
      </p>
      <p className="mt-1 text-[11px] text-slate-400">{label}</p>
    </div>
  )
}
