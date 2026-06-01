import { useApp } from '../context/AppContext.jsx'
import { useTranslation } from '../i18n/useTranslation.js'
import { getMembership } from '../data/memberships.js'
import { formatDate } from '../utils/format.js'
import { Chip } from './ui.jsx'
import Icon from './Icon.jsx'

const STATUS_TONE = {
  requested: 'amber',
  confirmed: 'brand',
  completed: 'green',
  cancelled: 'slate',
}

export default function ReservationCard({ reservation: r }) {
  const { t, lang } = useTranslation()
  const { setReservationStatus, deleteReservation } = useApp()
  const membership = getMembership(r.membershipId)
  const done = r.status === 'completed' || r.status === 'cancelled'

  // Party summary (adults + children with ages). Falls back to legacy `guests`.
  const adults = r.adults != null ? r.adults : r.guests
  const ageLabel = (age) => (age === 0 ? t('reservation.ageUnder1') : `${age} ${t('reservation.years')}`)
  const partyParts = []
  if (adults != null) partyParts.push(`${adults} ${t('reservation.adults')}`)
  if (r.children > 0) {
    const ages = r.childAges?.length ? ` (${r.childAges.map(ageLabel).join(', ')})` : ''
    partyParts.push(`${r.children} ${t('reservation.children')}${ages}`)
  }
  const party = partyParts.join(' · ') || '-'

  return (
    <div className={`card p-4 ${done ? 'opacity-75' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-bold text-slate-900">{r.title}</p>
          <p className="truncate text-xs text-slate-500">{membership?.name || r.membershipId}</p>
        </div>
        <Chip tone={STATUS_TONE[r.status] || 'slate'}>{t(`reservation.status${cap(r.status)}`)}</Chip>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
        <Info icon="calendar" value={r.date ? formatDate(r.date, lang) : '-'} />
        <Info icon="pin" value={r.hotel || '-'} />
        <Info icon="users" value={party} full />
      </div>

      {r.note && <p className="mt-2 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600">{r.note}</p>}

      <p className="mt-2 text-[11px] text-slate-400">{t('reservation.createdOn', { date: formatDate(r.createdAt, lang) })}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {r.status === 'requested' && (
          <button onClick={() => setReservationStatus(r.id, 'confirmed')} className="btn-secondary !py-2 text-xs">
            <Icon name="check" size={14} />
            {t('reservation.markConfirmed')}
          </button>
        )}
        {(r.status === 'requested' || r.status === 'confirmed') && (
          <>
            <button onClick={() => setReservationStatus(r.id, 'completed')} className="btn-primary !py-2 text-xs">
              <Icon name="check" size={14} />
              {t('reservation.markCompleted')}
            </button>
            <button onClick={() => setReservationStatus(r.id, 'cancelled')} className="btn-ghost !py-2 text-xs text-slate-500">
              {t('reservation.cancel')}
            </button>
          </>
        )}
        {done && (
          <button onClick={() => deleteReservation(r.id)} className="btn-ghost !py-2 text-xs text-slate-500">
            <Icon name="trash" size={14} />
            {t('common.delete')}
          </button>
        )}
      </div>
    </div>
  )
}

function Info({ icon, value, full }) {
  return (
    <span className={`flex items-center gap-1.5 text-slate-600 ${full ? 'col-span-2' : ''}`}>
      <Icon name={icon} size={14} className="shrink-0 text-slate-400" />
      <span className="truncate">{value}</span>
    </span>
  )
}

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
