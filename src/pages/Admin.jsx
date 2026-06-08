import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from '../i18n/useTranslation.js'
import { useAuth } from '../context/AuthContext.jsx'
import { api, USE_API } from '../api/index.js'
import { getMembership } from '../data/memberships.js'
import { formatMoney, formatDate } from '../utils/format.js'
import { Chip } from '../components/ui.jsx'
import EmptyState from '../components/EmptyState.jsx'
import CTAButton from '../components/CTAButton.jsx'
import Icon from '../components/Icon.jsx'

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '')
const ORDER_TONE = { requested: 'amber', invoiced: 'brand', paid: 'brand', activated: 'green', cancelled: 'slate' }
const RES_TONE = { requested: 'amber', confirmed: 'brand', completed: 'green', cancelled: 'slate' }
// Next status + the existing i18n action key for the advance button.
const ORDER_NEXT = { requested: ['invoiced', 'order.markInvoiced'], invoiced: ['paid', 'order.markPaid'], paid: ['activated', 'order.activate'] }
const RES_NEXT = { requested: ['confirmed', 'reservation.markConfirmed'], confirmed: ['completed', 'reservation.markCompleted'] }

const membershipName = (id) => getMembership(id)?.name || id

export default function Admin() {
  const { t, lang } = useTranslation()
  const { user, openSignIn } = useAuth()
  const [tab, setTab] = useState('orders')
  const [data, setData] = useState({ orders: [], reservations: [], assistance: [], settlement: null })
  const [state, setState] = useState('idle') // idle | loading | ok | forbidden | error

  const load = useCallback(async () => {
    setState('loading')
    try {
      const [orders, reservations, assistance, settlement] = await Promise.all([
        api.admin.listOrders(),
        api.admin.listReservations(),
        api.admin.listAssistance(),
        api.admin.settlement(),
      ])
      setData({ orders, reservations, assistance, settlement })
      setState('ok')
    } catch (e) {
      setState(e?.code === 'ADMIN_REQUIRED' || e?.status === 403 ? 'forbidden' : 'error')
    }
  }, [])

  useEffect(() => {
    if (USE_API && user) load()
  }, [user, load])

  const act = async (fn) => {
    try {
      await fn()
    } catch {
      /* surface via reload */
    }
    load()
  }

  if (!USE_API) return <Gate icon="bell" title={t('admin.title')} body={t('admin.apiOnly')} />
  if (!user)
    return (
      <Gate icon="send" title={t('admin.signInTitle')} body={t('admin.signInBody')}>
        <CTAButton variant="primary" onClick={() => openSignIn()}>
          {t('admin.signInCta')}
        </CTAButton>
      </Gate>
    )
  if (state === 'forbidden') return <Gate icon="help" title={t('admin.forbiddenTitle')} body={t('admin.forbiddenBody')} />

  const tabs = [
    ['orders', 'admin.tabOrders', data.orders.length],
    ['reservations', 'admin.tabReservations', data.reservations.length],
    ['assistance', 'admin.tabAssistance', data.assistance.length],
    ['settlement', 'admin.tabSettlement', null],
  ]

  return (
    <div className="page-pad space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">{t('admin.title')}</h1>
          <p className="mt-0.5 text-sm text-slate-500">{t('admin.subtitle')}</p>
        </div>
        <button
          onClick={load}
          className="shrink-0 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          {t('admin.refresh')}
        </button>
      </div>

      {state === 'error' && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{t('admin.loadError')}</p>
      )}

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 no-scrollbar">
        {tabs.map(([key, labelKey, count]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
              tab === key ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {t(labelKey)}
            {count != null && count > 0 && ` (${count})`}
          </button>
        ))}
      </div>

      {state === 'loading' ? (
        <p className="py-10 text-center text-sm text-slate-400">{t('admin.loading')}</p>
      ) : tab === 'orders' ? (
        <List items={data.orders} empty={t('admin.empty')}>
          {(o) => (
            <Row key={o.id}>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">{membershipName(o.membershipId)}</p>
                <p className="truncate text-xs text-slate-500">
                  {t('admin.buyer')}: {o.buyerName || o.buyerEmail || '—'}
                </p>
                <p className="mt-0.5 text-xs font-semibold tabular-nums text-slate-700">
                  {formatMoney(o.paidAmount, o.currency, lang)}
                  {o.commissionAmount > 0 && (
                    <span className="ml-1 font-normal text-slate-400">
                      · {t('order.commission')} {formatMoney(o.commissionAmount, o.currency, lang)}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <Chip tone={ORDER_TONE[o.status] || 'slate'}>{t(`order.status${cap(o.status)}`)}</Chip>
                {ORDER_NEXT[o.status] && (
                  <button
                    onClick={() => act(() => api.admin.setOrderStatus(o.id, ORDER_NEXT[o.status][0]))}
                    className="btn-secondary !px-3 !py-1.5 text-xs"
                  >
                    {t(ORDER_NEXT[o.status][1])}
                  </button>
                )}
              </div>
            </Row>
          )}
        </List>
      ) : tab === 'reservations' ? (
        <List items={data.reservations} empty={t('admin.empty')}>
          {(r) => (
            <Row key={r.id}>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">{r.title}</p>
                <p className="truncate text-xs text-slate-500">{membershipName(r.membershipId)}</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {r.date ? formatDate(r.date, lang) : '—'} · {r.hotel || '—'} · {r.adults}+{r.children}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <Chip tone={RES_TONE[r.status] || 'slate'}>{t(`reservation.status${cap(r.status)}`)}</Chip>
                {RES_NEXT[r.status] && (
                  <button
                    onClick={() => act(() => api.admin.setReservationStatus(r.id, RES_NEXT[r.status][0]))}
                    className="btn-secondary !px-3 !py-1.5 text-xs"
                  >
                    {t(RES_NEXT[r.status][1])}
                  </button>
                )}
              </div>
            </Row>
          )}
        </List>
      ) : tab === 'assistance' ? (
        <List items={data.assistance} empty={t('admin.empty')}>
          {(a) => <AssistanceRow key={a.id} item={a} onSave={(patch) => act(() => api.admin.updateAssistance(a.id, patch))} t={t} />}
        </List>
      ) : (
        <SettlementCard s={data.settlement} t={t} lang={lang} />
      )}
    </div>
  )
}

function AssistanceRow({ item, onSave, t }) {
  const [note, setNote] = useState(item.adminNote || '')
  const handled = item.status === 'handled'
  return (
    <Row>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-slate-800">{item.name || '—'}</p>
          <Chip tone={handled ? 'green' : 'amber'}>{handled ? t('admin.statusHandled') : t('admin.statusOpen')}</Chip>
        </div>
        <p className="truncate text-xs text-slate-500">
          {item.contact} · {item.requestType || t('admin.type')}
        </p>
        {item.message && <p className="mt-1 line-clamp-2 text-xs text-slate-600">{item.message}</p>}
        <div className="mt-2 flex gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('admin.notePlaceholder')}
            className="input !py-1.5 text-xs"
          />
          {!handled && (
            <button
              onClick={() => onSave({ status: 'handled', adminNote: note })}
              className="btn-primary shrink-0 !px-3 !py-1.5 text-xs"
            >
              {t('admin.markHandled')}
            </button>
          )}
          <button
            onClick={() => onSave({ adminNote: note })}
            className="btn-secondary shrink-0 !px-3 !py-1.5 text-xs"
          >
            {t('admin.saveNote')}
          </button>
        </div>
      </div>
    </Row>
  )
}

function SettlementCard({ s, t, lang }) {
  if (!s) return <EmptyState icon="compare" title={t('admin.empty')} />
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <Stat label={t('order.gmv')} value={formatMoney(s.gmv, s.currency, lang)} icon="tag" tone="brand" />
      <Stat label={t('order.commission')} value={formatMoney(s.commission, s.currency, lang)} icon="sparkles" tone="green" />
      <Stat label={t('admin.activatedOrders')} value={s.activatedOrderCount ?? 0} icon="check" />
    </div>
  )
}

function Stat({ label, value, icon, tone = 'slate' }) {
  const tones = { brand: 'text-brand-600', green: 'text-emerald-600', slate: 'text-slate-700' }
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-3.5">
      <Icon name={icon} size={16} className="text-slate-300" />
      <p className={`mt-1 text-lg font-extrabold tabular-nums ${tones[tone]}`}>{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  )
}

function List({ items, empty, children }) {
  if (!items || items.length === 0) return <EmptyState icon="bell" title={empty} />
  return <div className="space-y-2.5">{items.map(children)}</div>
}

function Row({ children }) {
  return <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-3.5">{children}</div>
}

function Gate({ icon, title, body, children }) {
  return (
    <div className="page-pad">
      <div className="mx-auto mt-10 max-w-sm rounded-3xl border border-slate-100 bg-white p-6 text-center">
        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <Icon name={icon} size={22} />
        </span>
        <h1 className="text-lg font-bold text-slate-900">{title}</h1>
        <p className="mt-1.5 text-sm text-slate-500">{body}</p>
        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  )
}
