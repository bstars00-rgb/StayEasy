import { useApp } from '../context/AppContext.jsx'
import { useTranslation } from '../i18n/useTranslation.js'
import { formatDate, daysUntil } from '../utils/format.js'
import { voucherPhoto, categoryMeta } from '../data/media.js'
import Icon from './Icon.jsx'
import SmartImage from './SmartImage.jsx'

// Category → icon + accent tone.
const CAT = {
  dining: { icon: 'utensils', tone: 'text-rose-500 bg-rose-50' },
  room: { icon: 'bed', tone: 'text-brand-600 bg-brand-50' },
  spa: { icon: 'flower', tone: 'text-emerald-600 bg-emerald-50' },
  discount: { icon: 'tag', tone: 'text-amber-600 bg-amber-50' },
  gift: { icon: 'gift', tone: 'text-fuchsia-600 bg-fuchsia-50' },
  other: { icon: 'dots', tone: 'text-slate-500 bg-slate-100' },
}

export default function VoucherCard({ membership, template, onRequest, onDetails, onTransfer }) {
  const { t, lang } = useTranslation()
  const { getVoucherStats } = useApp()

  const { used, available } = getVoucherStats(membership.id, template)
  const days = daysUntil(template.validUntil)
  const expired = days != null && days < 0
  const soon = !expired && days != null && days <= 30
  const cat = CAT[template.category] || CAT.other
  const disabled = available <= 0 || expired

  return (
    <div className={`card p-4 ${disabled ? 'opacity-70' : ''} ${soon ? 'ring-1 ring-rose-200' : ''}`}>
      <div className="flex items-start gap-3">
        <SmartImage
          src={voucherPhoto(template)}
          alt={template.title}
          gradient={categoryMeta(template.category).grad}
          icon={cat.icon}
          iconSize={20}
          rounded="rounded-xl"
          className="h-12 w-12 shrink-0"
        />
        <button onClick={() => onDetails?.(membership, template)} className="min-w-0 flex-1 text-left">
          <p className="flex items-center gap-1 font-bold leading-tight text-slate-900">
            <span className="truncate">{template.title}</span>
            <Icon name="chevronRight" size={14} className="shrink-0 text-slate-300" />
          </p>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            {membership.name} · {t(`voucherCat.${template.category}`)}
          </p>
        </button>
        <span className={`chip ${template.transferable ? 'bg-slate-100 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
          {t(template.transferable ? 'voucher.transferable' : 'voucher.nonTransferable')}
        </span>
      </div>

      {/* Counts */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Count label={t('voucher.total')} value={template.quantity} />
        <Count label={t('voucher.available')} value={available} highlight={available > 0} />
        <Count label={t('voucher.used')} value={used} muted />
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs">
        <Icon name="clock" size={14} className={soon ? 'text-rose-500' : 'text-slate-400'} />
        <span className={soon ? 'font-semibold text-rose-600' : 'text-slate-500'}>
          {expired ? t('status.expired') : t('status.expiresOn', { date: formatDate(template.validUntil, lang) })}
        </span>
      </div>

      {(template.hotels?.length > 0 || template.note) && (
        <div className="mt-2 space-y-1 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-500">
          {template.hotels?.length > 0 && (
            <p>
              <span className="font-semibold text-slate-600">{t('voucher.eligibleHotels')}: </span>
              {template.hotels.join(', ')}
            </p>
          )}
          {template.note && (
            <p>
              <span className="font-semibold text-slate-600">{t('voucher.onSiteNote')}: </span>
              {template.note}
            </p>
          )}
        </div>
      )}

      <button
        onClick={() => onRequest(membership, template)}
        disabled={disabled}
        className="btn-primary mt-3 w-full disabled:cursor-not-allowed"
      >
        <Icon name="calendar" size={17} />
        {available <= 0 ? t('voucher.allUsed') : t('voucher.requestBooking')}
      </button>
      {template.transferable && onTransfer && available > 0 && (
        <button onClick={() => onTransfer(membership, template)} className="btn-ghost mt-2 w-full text-slate-600">
          <Icon name="gift" size={16} />
          {t('transfer.action')}
        </button>
      )}
    </div>
  )
}

function Count({ label, value, highlight, muted }) {
  return (
    <div className="rounded-xl bg-slate-50 py-2">
      <p className={`text-lg font-extrabold leading-none tabular-nums ${highlight ? 'text-brand-600' : muted ? 'text-slate-400' : 'text-slate-800'}`}>
        {value}
      </p>
      <p className="mt-1 text-[11px] text-slate-400">{label}</p>
    </div>
  )
}
