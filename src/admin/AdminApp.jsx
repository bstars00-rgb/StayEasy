import { useState, useEffect, useRef, useCallback } from 'react'
import { translate, LANGUAGES } from '../i18n/translations.js'
import { api, USE_API } from '../api/index.js'
import * as storage from '../utils/storage.js'
import { demoUser, isRealGoogleEnabled, renderRealGoogleButton } from '../auth/google.js'
import { getMembership } from '../data/memberships.js'
import { formatMoney, formatDate } from '../utils/format.js'
import Icon from '../components/Icon.jsx'

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '')
const membershipName = (id) => getMembership(id)?.name || id
const ORDER_TONE = { requested: 'amber', invoiced: 'sky', paid: 'sky', activated: 'emerald', cancelled: 'slate' }
const RES_TONE = { requested: 'amber', confirmed: 'sky', completed: 'emerald', cancelled: 'slate' }
const ORDER_NEXT = { requested: ['invoiced', 'order.markInvoiced'], invoiced: ['paid', 'order.markPaid'], paid: ['activated', 'order.activate'] }
const RES_NEXT = { requested: ['confirmed', 'reservation.markConfirmed'], confirmed: ['completed', 'reservation.markCompleted'] }

// Standalone OhmySelect Admin website — separate web entry (admin/index.html),
// its own desktop layout and lightweight auth. Talks to /api/v1/admin/* via the
// shared API client (VITE_API_BASE_URL). No consumer-app context.
export default function AdminApp() {
  const [lang, setLang] = useState('en')
  const [user, setUser] = useState(() => storage.getAuthUser())
  const t = useCallback((k, v) => translate(lang, k, v), [lang])

  const completeSignIn = useCallback(async (profile) => {
    const data = await api.auth.google(profile.idToken || profile.id || profile.email || 'demo')
    const token = data.accessToken || data.token
    const next = { ...(data.user || profile), token, accessToken: token, signedInAt: new Date().toISOString() }
    storage.setAuthUser(next)
    setUser(next)
  }, [])

  const signOut = useCallback(() => {
    storage.clearAuthUser()
    setUser(null)
  }, [])

  if (!USE_API) return <Centered icon="bell" title={t('admin.title')} body={t('admin.apiOnly')} lang={lang} setLang={setLang} t={t} />
  if (!user) return <SignIn onSignIn={completeSignIn} lang={lang} setLang={setLang} t={t} />

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar user={user} onSignOut={signOut} lang={lang} setLang={setLang} t={t} />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <Console t={t} lang={lang} onUnauthorized={signOut} />
      </main>
    </div>
  )
}

function TopBar({ user, onSignOut, lang, setLang, t }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-extrabold tracking-tight text-brand-700">Ohmy</span>
          <span className="text-lg font-extrabold tracking-tight text-gold-600">Select</span>
          <span className="ml-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-3">
          <LangToggle lang={lang} setLang={setLang} />
          <span className="hidden text-xs text-slate-500 sm:inline">{user.email}</span>
          <button onClick={onSignOut} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
            {t('auth.signOut')}
          </button>
        </div>
      </div>
    </header>
  )
}

function LangToggle({ lang, setLang }) {
  return (
    <select value={lang} onChange={(e) => setLang(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600">
      {LANGUAGES.map((l) => (
        <option key={l.code} value={l.code}>
          {l.label}
        </option>
      ))}
    </select>
  )
}

function Console({ t, lang, onUnauthorized }) {
  const [tab, setTab] = useState('orders')
  const [data, setData] = useState({ orders: [], reservations: [], assistance: [], settlement: null })
  const [state, setState] = useState('loading')

  const load = useCallback(async () => {
    setState('loading')
    // allSettled so one slow/failing endpoint doesn't blank the whole console.
    const settled = await Promise.allSettled([
      api.admin.listOrders(),
      api.admin.listReservations(),
      api.admin.listAssistance(),
      api.admin.settlement(),
    ])
    // Any 403 => not an admin (show the forbidden screen).
    const is403 = (s) => s.status === 'rejected' && (s.reason?.code === 'ADMIN_REQUIRED' || s.reason?.status === 403)
    if (settled.some(is403)) return setState('forbidden')
    if (settled.every((s) => s.status === 'rejected')) return setState('error')
    const val = (i, fb) => (settled[i].status === 'fulfilled' ? settled[i].value : fb)
    setData({ orders: val(0, []), reservations: val(1, []), assistance: val(2, []), settlement: val(3, null) })
    setState('ok')
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const act = async (fn) => {
    try {
      await fn()
    } catch {
      /* surface via reload */
    }
    load()
  }

  if (state === 'forbidden')
    return (
      <Panel>
        <EmptyBlock icon="help" title={t('admin.forbiddenTitle')} body={t('admin.forbiddenBody')}>
          <button onClick={onUnauthorized} className="btn-ghost mt-3 text-slate-600">
            {t('auth.signOut')}
          </button>
        </EmptyBlock>
      </Panel>
    )

  const tabs = [
    ['orders', 'admin.tabOrders', data.orders.length],
    ['reservations', 'admin.tabReservations', data.reservations.length],
    ['assistance', 'admin.tabAssistance', data.assistance.length],
    ['settlement', 'admin.tabSettlement', null],
  ]

  return (
    <>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{t('admin.title')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('admin.subtitle')}</p>
        </div>
        <button onClick={load} className="shrink-0 rounded-full border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
          {t('admin.refresh')}
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map(([key, labelKey, count]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${tab === key ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}
          >
            {t(labelKey)}
            {count != null && count > 0 && ` (${count})`}
          </button>
        ))}
      </div>

      {state === 'error' && <p className="mb-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{t('admin.loadError')}</p>}

      {state === 'loading' ? (
        <p className="py-16 text-center text-sm text-slate-400">{t('admin.loading')}</p>
      ) : tab === 'orders' ? (
        <OrdersTable rows={data.orders} t={t} lang={lang} act={act} />
      ) : tab === 'reservations' ? (
        <ReservationsTable rows={data.reservations} t={t} lang={lang} act={act} />
      ) : tab === 'assistance' ? (
        <AssistanceTable rows={data.assistance} t={t} act={act} />
      ) : (
        <Settlement s={data.settlement} t={t} lang={lang} />
      )}
    </>
  )
}

function OrdersTable({ rows, t, lang, act }) {
  if (!rows.length) return <Empty t={t} />
  return (
    <Panel>
      <Table head={[t('common.brand'), t('admin.buyer'), t('order.amount'), t('order.commission'), 'Status', '']}>
        {rows.map((o) => (
          <tr key={o.id} className="border-t border-slate-100">
            <Td className="font-semibold text-slate-800">{membershipName(o.membershipId)}</Td>
            <Td className="text-slate-500">{o.buyerName || o.buyerEmail || '—'}</Td>
            <Td className="tabular-nums">{formatMoney(o.paidAmount, o.currency, lang)}</Td>
            <Td className="tabular-nums text-slate-500">{o.commissionAmount ? formatMoney(o.commissionAmount, o.currency, lang) : '—'}</Td>
            <Td><Badge tone={ORDER_TONE[o.status]}>{t(`order.status${cap(o.status)}`)}</Badge></Td>
            <Td className="text-right">
              {ORDER_NEXT[o.status] && (
                <Advance onClick={() => act(() => api.admin.setOrderStatus(o.id, ORDER_NEXT[o.status][0]))}>{t(ORDER_NEXT[o.status][1])}</Advance>
              )}
            </Td>
          </tr>
        ))}
      </Table>
    </Panel>
  )
}

function ReservationsTable({ rows, t, lang, act }) {
  if (!rows.length) return <Empty t={t} />
  return (
    <Panel>
      <Table head={['Voucher', t('common.brand'), t('reservation.date'), t('reservation.hotel'), 'Status', '']}>
        {rows.map((r) => (
          <tr key={r.id} className="border-t border-slate-100">
            <Td className="font-semibold text-slate-800">{r.title}</Td>
            <Td className="text-slate-500">{membershipName(r.membershipId)}</Td>
            <Td>{r.date ? formatDate(r.date, lang) : '—'}</Td>
            <Td className="text-slate-500">{r.hotel || '—'}</Td>
            <Td><Badge tone={RES_TONE[r.status]}>{t(`reservation.status${cap(r.status)}`)}</Badge></Td>
            <Td className="text-right">
              {RES_NEXT[r.status] && (
                <Advance onClick={() => act(() => api.admin.setReservationStatus(r.id, RES_NEXT[r.status][0]))}>{t(RES_NEXT[r.status][1])}</Advance>
              )}
            </Td>
          </tr>
        ))}
      </Table>
    </Panel>
  )
}

function AssistanceTable({ rows, t, act }) {
  if (!rows.length) return <Empty t={t} />
  return (
    <div className="space-y-3">
      {rows.map((a) => (
        <AssistanceRow key={a.id} item={a} t={t} onSave={(patch) => act(() => api.admin.updateAssistance(a.id, patch))} />
      ))}
    </div>
  )
}

function AssistanceRow({ item, t, onSave }) {
  const [note, setNote] = useState(item.adminNote || '')
  const handled = item.status === 'handled'
  return (
    <Panel>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-slate-800">{item.name || '—'}</p>
            <Badge tone={handled ? 'emerald' : 'amber'}>{handled ? t('admin.statusHandled') : t('admin.statusOpen')}</Badge>
          </div>
          <p className="text-xs text-slate-500">{item.contact} · {item.requestType || t('admin.type')}</p>
          {item.message && <p className="mt-1 max-w-2xl text-sm text-slate-600">{item.message}</p>}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('admin.notePlaceholder')} className="input !py-2 text-sm sm:max-w-md" />
        {!handled && (
          <button onClick={() => onSave({ status: 'handled', adminNote: note })} className="btn-primary !px-4 !py-2 text-sm">
            {t('admin.markHandled')}
          </button>
        )}
        <button onClick={() => onSave({ adminNote: note })} className="btn-secondary !px-4 !py-2 text-sm">
          {t('admin.saveNote')}
        </button>
      </div>
    </Panel>
  )
}

function Settlement({ s, t, lang }) {
  if (!s) return <Empty t={t} />
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <StatCard label={t('order.gmv')} value={formatMoney(s.gmv, s.currency, lang)} tone="text-brand-700" icon="tag" />
      <StatCard label={t('order.commission')} value={formatMoney(s.commission, s.currency, lang)} tone="text-emerald-600" icon="sparkles" />
      <StatCard label={t('admin.activatedOrders')} value={s.activatedOrderCount ?? 0} tone="text-slate-800" icon="check" />
    </div>
  )
}

// ── Sign-in ──────────────────────────────────────────────────────────────
function SignIn({ onSignIn, lang, setLang, t }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(false)
  const gisRef = useRef(null)

  useEffect(() => {
    if (isRealGoogleEnabled() && gisRef.current) {
      renderRealGoogleButton(gisRef.current, (profile) => onSignIn(profile)).catch(() => {})
    }
  }, [onSignIn])

  const demo = async () => {
    setBusy(true)
    setErr(false)
    try {
      await onSignIn(demoUser())
    } catch {
      setErr(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-extrabold tracking-tight text-brand-700">Ohmy</span>
          <span className="text-lg font-extrabold tracking-tight text-gold-600">Select</span>
          <span className="ml-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">Admin</span>
        </div>
        <LangToggle lang={lang} setLang={setLang} />
      </div>
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-3xl border border-slate-100 bg-white p-7 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">{t('admin.signInTitle')}</h1>
          <p className="mt-1.5 text-sm text-slate-500">{t('admin.signInBody')}</p>
          {isRealGoogleEnabled() ? (
            <div ref={gisRef} className="mt-5 flex justify-center" />
          ) : (
            <button onClick={demo} disabled={busy} className="btn-primary mt-5 w-full disabled:opacity-50">
              <Icon name="send" size={16} />
              {t('admin.signInCta')} (Google · demo)
            </button>
          )}
          {err && <p className="mt-3 text-xs text-rose-600">{t('admin.loadError')}</p>}
        </div>
      </div>
    </div>
  )
}

// ── Small UI atoms ─────────────────────────────────────────────────────────
function Panel({ children }) {
  return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">{children}</div>
}
function Table({ head, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {head.map((h, i) => (
              <th key={i} className={`px-4 py-2.5 ${i === head.length - 1 ? 'text-right' : ''}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}
function Td({ children, className = '' }) {
  return <td className={`px-4 py-3 align-middle text-slate-700 ${className}`}>{children}</td>
}
function Badge({ tone = 'slate', children }) {
  const tones = {
    amber: 'bg-amber-50 text-amber-700',
    sky: 'bg-sky-50 text-sky-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    slate: 'bg-slate-100 text-slate-500',
  }
  return <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone] || tones.slate}`}>{children}</span>
}
function Advance({ onClick, children }) {
  return (
    <button onClick={onClick} className="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100">
      {children}
    </button>
  )
}
function StatCard({ label, value, tone, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <Icon name={icon} size={18} className="text-slate-300" />
      <p className={`mt-2 text-2xl font-extrabold tabular-nums ${tone}`}>{value}</p>
      <p className="mt-0.5 text-sm text-slate-400">{label}</p>
    </div>
  )
}
function Empty({ t }) {
  return <EmptyBlock icon="bell" title={t('admin.empty')} />
}
function EmptyBlock({ icon, title, body, children }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-14 text-center">
      <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Icon name={icon} size={22} />
      </span>
      <p className="font-semibold text-slate-700">{title}</p>
      {body && <p className="mt-1 text-sm text-slate-500">{body}</p>}
      {children}
    </div>
  )
}
function Centered({ icon, title, body, lang, setLang }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-3xl border border-slate-100 bg-white p-7 text-center">
        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <Icon name={icon} size={22} />
        </span>
        <h1 className="text-lg font-bold text-slate-900">{title}</h1>
        <p className="mt-1.5 text-sm text-slate-500">{body}</p>
        <div className="mt-4 flex justify-center">
          <LangToggle lang={lang} setLang={setLang} />
        </div>
      </div>
    </div>
  )
}
