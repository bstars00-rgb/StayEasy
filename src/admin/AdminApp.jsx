import { useState, useEffect, useRef, useCallback, useMemo, Fragment } from 'react'
import { translate, LANGUAGES } from '../i18n/translations.js'
import { api, USE_API } from '../api/index.js'
import { itemsOf, downloadCsv } from '../api/admin.js'
import * as storage from '../utils/storage.js'
import { demoUser, isRealGoogleEnabled, renderRealGoogleButton } from '../auth/google.js'
import { getMembership } from '../data/memberships.js'
import { formatMoney, formatDate } from '../utils/format.js'
import Icon from '../components/Icon.jsx'

const INTL_LOCALE = { en: 'en-US', ko: 'ko-KR', vi: 'vi-VN', zh: 'zh-CN', ja: 'ja-JP' }
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '')
const membershipName = (id) => getMembership(id)?.name || id
const ORDER_TONE = { requested: 'amber', invoiced: 'sky', paid: 'sky', activated: 'emerald', cancelled: 'slate' }
const RES_TONE = { requested: 'amber', confirmed: 'sky', completed: 'emerald', cancelled: 'slate' }
const ORDER_NEXT = { requested: ['invoiced', 'order.markInvoiced'], invoiced: ['paid', 'order.markPaid'], paid: ['activated', 'order.activate'] }
const RES_NEXT = { requested: ['confirmed', 'reservation.markConfirmed'], confirmed: ['completed', 'reservation.markCompleted'] }

const NAV = [
  ['dashboard', 'admin.tabDashboard', 'compare'],
  ['orders', 'admin.tabOrders', 'tag'],
  ['reservations', 'admin.tabReservations', 'calendar'],
  ['assistance', 'admin.tabAssistance', 'help'],
  ['catalog', 'admin.tabCatalog', 'bookmark'],
  ['availability', 'admin.tabAvailability', 'clock'],
  ['members', 'admin.tabMembers', 'users'],
  ['settlement', 'admin.tabSettlement', 'sparkles'],
  ['audit', 'admin.tabAudit', 'history'],
]

// Run an async fetch once on mount; expose {loading,error,data,reload}.
function useAsync(fn) {
  const [s, setS] = useState({ loading: true, error: false, data: null })
  const reload = useCallback(async () => {
    setS((p) => ({ ...p, loading: true, error: false }))
    try {
      const data = await fn()
      setS({ loading: false, error: false, data })
    } catch (e) {
      setS({ loading: false, error: e?.code === 'ADMIN_REQUIRED' || e?.status === 403 ? 'forbidden' : true, data: null })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    reload()
  }, [reload])
  return { ...s, reload }
}

export default function AdminApp() {
  const [lang, setLang] = useState('en')
  const [user, setUser] = useState(() => storage.getAuthUser())
  const t = useCallback((k, v) => translate(lang, k, v), [lang])

  const completeSignIn = useCallback(async (profile) => {
    const data = await api.auth.google(profile.idToken || profile.id || profile.email || 'demo')
    const token = data.accessToken || data.token
    storage.setAuthUser({ ...(data.user || profile), token, accessToken: token, signedInAt: new Date().toISOString() })
    setUser(storage.getAuthUser())
  }, [])
  const signOut = useCallback(() => {
    storage.clearAuthUser()
    setUser(null)
  }, [])

  if (!USE_API) return <Centered icon="bell" title={t('admin.title')} body={t('admin.apiOnly')} lang={lang} setLang={setLang} />
  if (!user)
    return (
      <SignIn onSignIn={completeSignIn} lang={lang} setLang={setLang} t={t} />
    )

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar user={user} onSignOut={signOut} lang={lang} setLang={setLang} t={t} />
      <Console t={t} lang={lang} onUnauthorized={signOut} />
    </div>
  )
}

function TopBar({ user, onSignOut, lang, setLang, t }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-extrabold tracking-tight text-brand-700">Ohmy</span>
          <span className="text-lg font-extrabold tracking-tight text-gold-600">Select</span>
          <span className="ml-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">Admin</span>
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
        <option key={l.code} value={l.code}>{l.label}</option>
      ))}
    </select>
  )
}

function Console({ t, lang, onUnauthorized }) {
  const [tab, setTab] = useState('dashboard')
  // Access probe (also the dashboard data); 403 => not authorized.
  const access = useAsync(() => api.admin.dashboard())

  if (access.loading) return <Shell t={t}><Loading t={t} /></Shell>
  if (access.error === 'forbidden')
    return (
      <Shell t={t}>
        <EmptyBlock icon="help" title={t('admin.forbiddenTitle')} body={t('admin.forbiddenBody')}>
          <button onClick={onUnauthorized} className="btn-ghost mt-3 text-slate-600">{t('auth.signOut')}</button>
        </EmptyBlock>
      </Shell>
    )
  if (access.error) return <Shell t={t}><ErrBlock t={t} onRetry={access.reload} /></Shell>

  const tabs = {
    dashboard: <DashboardTab t={t} lang={lang} data={access.data} />,
    orders: <OrdersTab t={t} lang={lang} />,
    reservations: <ReservationsTab t={t} lang={lang} />,
    assistance: <AssistanceTab t={t} />,
    catalog: <CatalogTab t={t} lang={lang} />,
    availability: <AvailabilityTab t={t} lang={lang} />,
    members: <MembersTab t={t} lang={lang} />,
    settlement: <SettlementTab t={t} lang={lang} />,
    audit: <AuditTab t={t} lang={lang} />,
  }

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-52 shrink-0 lg:block">
        <nav className="sticky top-20 space-y-1">
          {NAV.map(([key, labelKey, icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                tab === key ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-white'
              }`}
            >
              <Icon name={icon} size={16} className={tab === key ? '' : 'text-slate-400'} />
              {t(labelKey)}
            </button>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 flex-1">
        {/* Tabs (mobile) */}
        <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 lg:hidden">
          {NAV.map(([key, labelKey]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold ${tab === key ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>
        <h1 className="mb-4 text-2xl font-extrabold text-slate-900">{t(NAV.find((n) => n[0] === tab)[1])}</h1>
        {tabs[tab]}
      </main>
    </div>
  )
}

function Shell({ t, children }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <h1 className="mb-4 text-2xl font-extrabold text-slate-900">{t('admin.title')}</h1>
      {children}
    </div>
  )
}

/* ── Dashboard ─────────────────────────────────────────────────────────── */
function DashboardTab({ t, lang, data }) {
  const d = data
  const cards = [
    [t('partner.gmv'), formatMoney(d.gmv, d.currency, lang), 'tag', 'brand'],
    [t('order.commission'), formatMoney(d.commission, d.currency, lang), 'sparkles', 'emerald'],
    [t('partner.orders'), d.orders.total, 'tag', 'slate'],
    [t('partner.reservations'), d.reservations.total, 'calendar', 'slate'],
    [t('partner.memberships'), d.activeMemberships, 'bookmark', 'slate'],
    [t('admin.kpiExpiring'), d.expiringVouchers, 'clock', d.expiringVouchers > 0 ? 'amber' : 'slate'],
  ]
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map(([label, value, icon, tone]) => (
          <StatCard key={label} label={label} value={value} icon={icon} tone={tone} />
        ))}
      </div>
      <Panel>
        <div className="space-y-5 p-4">
          <div>
            <p className="mb-2.5 text-sm font-bold text-slate-700">{t('admin.tabOrders')} · {t('partner.byStatus')}</p>
            <div className="space-y-2">
              {Object.entries(d.orders.byStatus).map(([s, n]) => (
                <DistBar key={s} label={t(`order.status${cap(s)}`)} count={n} total={d.orders.total} tone={ORDER_TONE[s]} />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2.5 text-sm font-bold text-slate-700">{t('admin.tabReservations')} · {t('partner.byStatus')}</p>
            <div className="space-y-2">
              {Object.entries(d.reservations.byStatus).map(([s, n]) => (
                <DistBar key={s} label={t(`reservation.status${cap(s)}`)} count={n} total={d.reservations.total} tone={RES_TONE[s]} />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2.5 text-sm font-bold text-slate-700">{t('admin.tabAssistance')}</p>
            <div className="space-y-2">
              <DistBar label={t('admin.statusOpen')} count={d.assistance.open} total={d.assistance.open + d.assistance.handled} tone="amber" />
              <DistBar label={t('admin.statusHandled')} count={d.assistance.handled} total={d.assistance.open + d.assistance.handled} tone="emerald" />
            </div>
          </div>
        </div>
      </Panel>

      <TopBrandsPanel t={t} lang={lang} />
    </div>
  )
}

const BAR_FILL = { amber: 'bg-amber-400', sky: 'bg-sky-400', emerald: 'bg-emerald-500', brand: 'bg-brand-500', slate: 'bg-slate-300' }

// One labelled proportion bar (count / total).
function DistBar({ label, count, total, tone }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 truncate text-xs text-slate-500">{label}</span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${BAR_FILL[tone] || BAR_FILL.slate}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-600">{count}</span>
    </div>
  )
}

// Top brands by GMV (reuses the settlement summary; renders nothing if unavailable).
function TopBrandsPanel({ t, lang }) {
  const { data, loading, error } = useAsync(() => api.admin.settlement())
  if (loading || error || !data) return null
  const brands = itemsOf(data.byBrand).slice().sort((a, b) => (b.gmv || 0) - (a.gmv || 0)).slice(0, 5)
  if (!brands.length) return null
  const max = Math.max(...brands.map((b) => b.gmv || 0), 1)
  return (
    <Panel>
      <div className="border-b border-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700">{t('admin.topBrands')}</div>
      <div className="space-y-2.5 p-4">
        {brands.map((b) => (
          <div key={b.membershipId} className="flex items-center gap-3">
            <span className="w-36 shrink-0 truncate text-xs font-medium text-slate-600">{membershipName(b.membershipId)}</span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.round(((b.gmv || 0) / max) * 100)}%` }} />
            </div>
            <span className="w-24 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-600">{formatMoney(b.gmv, data.currency, lang)}</span>
          </div>
        ))}
      </div>
    </Panel>
  )
}

/* ── Orders / Reservations / Assistance ────────────────────────────────── */
function OrdersTab({ t, lang }) {
  const { data, loading, error, reload } = useAsync(() => api.admin.listOrders())
  const act = (fn) => fn().catch(() => {}).then(reload)
  if (loading) return <Loading t={t} />
  if (error) return <ErrBlock t={t} onRetry={reload} />
  const rows = itemsOf(data)
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
              {ORDER_NEXT[o.status] && <Advance onClick={() => act(() => api.admin.setOrderStatus(o.id, ORDER_NEXT[o.status][0]))}>{t(ORDER_NEXT[o.status][1])}</Advance>}
            </Td>
          </tr>
        ))}
      </Table>
    </Panel>
  )
}

function ReservationsTab({ t, lang }) {
  const { data, loading, error, reload } = useAsync(() => api.admin.listReservations())
  const act = (fn) => fn().catch(() => {}).then(reload)
  if (loading) return <Loading t={t} />
  if (error) return <ErrBlock t={t} onRetry={reload} />
  const rows = itemsOf(data)
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
              {RES_NEXT[r.status] && <Advance onClick={() => act(() => api.admin.setReservationStatus(r.id, RES_NEXT[r.status][0]))}>{t(RES_NEXT[r.status][1])}</Advance>}
            </Td>
          </tr>
        ))}
      </Table>
    </Panel>
  )
}

function AssistanceTab({ t }) {
  const { data, loading, error, reload } = useAsync(() => api.admin.listAssistance())
  if (loading) return <Loading t={t} />
  if (error) return <ErrBlock t={t} onRetry={reload} />
  const rows = itemsOf(data)
  if (!rows.length) return <Empty t={t} />
  return (
    <div className="space-y-3">
      {rows.map((a) => (
        <AssistanceRow key={a.id} item={a} t={t} onSave={(patch) => api.admin.updateAssistance(a.id, patch).catch(() => {}).then(reload)} />
      ))}
    </div>
  )
}

function AssistanceRow({ item, t, onSave }) {
  const [note, setNote] = useState(item.adminNote || '')
  const handled = item.status === 'handled'
  return (
    <Panel>
      <div className="p-4">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-slate-800">{item.name || '—'}</p>
          <Badge tone={handled ? 'emerald' : 'amber'}>{handled ? t('admin.statusHandled') : t('admin.statusOpen')}</Badge>
        </div>
        <p className="text-xs text-slate-500">{item.contact} · {item.requestType || t('admin.type')}</p>
        {item.message && <p className="mt-1 max-w-2xl text-sm text-slate-600">{item.message}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('admin.notePlaceholder')} className="input !py-2 text-sm sm:max-w-md" />
          {!handled && <button onClick={() => onSave({ status: 'handled', adminNote: note })} className="btn-primary !px-4 !py-2 text-sm">{t('admin.markHandled')}</button>}
          <button onClick={() => onSave({ adminNote: note })} className="btn-secondary !px-4 !py-2 text-sm">{t('admin.saveNote')}</button>
        </div>
      </div>
    </Panel>
  )
}

/* ── Catalog ───────────────────────────────────────────────────────────── */
const CURRENCIES = ['VND', 'USD', 'KRW', 'THB', 'JPY']
const COUNTRIES = ['vietnam', 'korea', 'thailand', 'japan']
const BLANK_MEMBERSHIP = { id: '', name: '', brand: '', country: 'vietnam', currency: 'VND', annualFee: 0, salePrice: '', commissionPct: 0, active: true }

function MembershipForm({ initial, lockId, submitLabel, onSubmit, onCancel, t }) {
  const [form, setForm] = useState(initial)
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const submit = async () => {
    if (!String(form.id).trim() || !String(form.name).trim() || !String(form.brand).trim()) return
    setBusy(true)
    try {
      await onSubmit({
        id: String(form.id).trim(),
        name: form.name.trim(),
        brand: form.brand.trim(),
        country: form.country,
        currency: form.currency,
        annualFee: Number(form.annualFee) || 0,
        salePrice: form.salePrice === '' || form.salePrice == null ? null : Number(form.salePrice),
        commissionRate: (Number(form.commissionPct) || 0) / 100,
        active: form.active !== false,
      })
    } catch {
      /* 403 / validation */
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="space-y-2">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <input value={form.id} onChange={(e) => set('id', e.target.value)} placeholder={t('admin.membershipId')} disabled={lockId} className="input !py-1.5 text-sm disabled:bg-slate-100 disabled:text-slate-400" />
        <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder={t('admin.name')} className="input !py-1.5 text-sm" />
        <input value={form.brand} onChange={(e) => set('brand', e.target.value)} placeholder={t('common.brand')} className="input !py-1.5 text-sm" />
        <select value={form.country} onChange={(e) => set('country', e.target.value)} className="input !py-1.5 text-sm">
          {COUNTRIES.map((c) => <option key={c} value={c}>{t(`countries.${c}`)}</option>)}
        </select>
        <select value={form.currency} onChange={(e) => set('currency', e.target.value)} className="input !py-1.5 text-sm">
          {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="number" min="0" value={form.annualFee} onChange={(e) => set('annualFee', e.target.value)} placeholder={t('common.annualFee')} className="input !py-1.5 text-sm" />
        <input type="number" min="0" value={form.salePrice} onChange={(e) => set('salePrice', e.target.value)} placeholder={t('admin.salePrice')} className="input !py-1.5 text-sm" />
        <input type="number" min="0" max="100" value={form.commissionPct} onChange={(e) => set('commissionPct', e.target.value)} placeholder={`${t('admin.commissionRate')} %`} className="input !py-1.5 text-sm" />
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={form.active !== false} onChange={(e) => set('active', e.target.checked)} /> {t('admin.active')}
        </label>
      </div>
      <div className="flex gap-2">
        <button onClick={submit} disabled={busy} className="btn-primary !px-3 !py-1.5 text-xs disabled:opacity-50">{submitLabel}</button>
        <button onClick={onCancel} className="btn-ghost !px-3 !py-1.5 text-xs text-slate-500">{t('common.cancel')}</button>
      </div>
    </div>
  )
}

function CatalogTab({ t, lang }) {
  const { data, loading, error, reload } = useAsync(() => api.admin.listMemberships())
  const [openId, setOpenId] = useState(null)
  const [editId, setEditId] = useState(null)
  const [adding, setAdding] = useState(false)
  if (loading) return <Loading t={t} />
  if (error) return <ErrBlock t={t} onRetry={reload} />
  const rows = itemsOf(data)

  const createM = async (f) => {
    await api.admin.createMembership(f)
    setAdding(false)
    reload()
  }
  const saveM = async (f) => {
    await api.admin.updateMembership(f.id, f)
    setEditId(null)
    reload()
  }
  const removeM = (id) => api.admin.deleteMembership(id).catch(() => {}).then(reload)

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button onClick={() => setAdding((a) => !a)} className="btn-secondary !px-3 !py-1.5 text-sm">
          <Icon name="plus" size={14} /> {t('admin.addMembership')}
        </button>
      </div>
      {adding && (
        <Panel>
          <div className="p-3">
            <MembershipForm initial={BLANK_MEMBERSHIP} submitLabel={t('admin.addMembership')} onSubmit={createM} onCancel={() => setAdding(false)} t={t} />
          </div>
        </Panel>
      )}
      <Panel>
        <Table head={[t('common.brand'), t('common.annualFee'), t('admin.salePrice'), t('admin.commissionRate'), t('common.cities'), '']}>
          {rows.map((m) => (
            <Fragment key={m.id}>
              <tr className="border-t border-slate-100 hover:bg-slate-50">
                <Td className="cursor-pointer" onClick={() => setOpenId(openId === m.id ? null : m.id)}>
                  <p className="font-semibold text-slate-800">{m.name}</p>
                  <p className="text-xs text-slate-400">{m.brand}{m.active === false && <span className="ml-2 text-rose-500">· {t('admin.inactive')}</span>}</p>
                </Td>
                <Td className="tabular-nums">{m.annualFee ? formatMoney(m.annualFee, m.currency, lang) : t('common.free')}</Td>
                <Td className="tabular-nums">{m.salePrice != null ? formatMoney(m.salePrice, m.currency, lang) : '—'}</Td>
                <Td className="tabular-nums text-slate-500">{m.commissionRate != null ? `${Math.round(m.commissionRate * 100)}%` : '—'}</Td>
                <Td className="text-slate-500">{(m.cities || []).length}</Td>
                <Td className="whitespace-nowrap text-right">
                  <button onClick={() => setEditId(editId === m.id ? null : m.id)} className="mr-2 font-semibold text-brand-600 hover:underline">{t('admin.edit')}</button>
                  <button onClick={() => removeM(m.id)} aria-label={t('common.delete')} className="rounded p-1 align-middle text-slate-300 hover:text-rose-500">
                    <Icon name="trash" size={14} />
                  </button>
                </Td>
              </tr>
              {editId === m.id && (
                <tr className="border-t border-slate-100 bg-brand-50/30">
                  <td colSpan={6} className="px-4 py-3">
                    <MembershipForm
                      initial={{ id: m.id, name: m.name, brand: m.brand, country: m.country || 'vietnam', currency: m.currency || 'VND', annualFee: m.annualFee || 0, salePrice: m.salePrice ?? '', commissionPct: m.commissionRate != null ? Math.round(m.commissionRate * 100) : 0, active: m.active !== false }}
                      lockId
                      submitLabel={t('common.save')}
                      onSubmit={saveM}
                      onCancel={() => setEditId(null)}
                      t={t}
                    />
                  </td>
                </tr>
              )}
              {openId === m.id && (
                <tr className="border-t border-slate-100 bg-slate-50/60">
                  <td colSpan={6} className="px-4 py-3">
                    <VoucherInventory membershipId={m.id} t={t} />
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </Table>
      </Panel>
    </div>
  )
}

const VOUCHER_CATS = ['dining', 'room', 'spa', 'discount', 'gift', 'other']
// Languages an admin can translate a voucher into (English is the source row).
const TRANSLATABLE = LANGUAGES.filter((l) => l.code !== 'en')
const BLANK_VOUCHER = { templateId: '', title: '', category: 'dining', quantity: 1, validUntil: '2026-12-31', transferable: false, description: '', note: '', i18n: {} }

// Drop empty language entries so we only persist real translations.
function cleanI18n(i18n) {
  const out = {}
  for (const [lng, v] of Object.entries(i18n || {})) {
    const title = (v?.title || '').trim()
    const description = (v?.description || '').trim()
    const note = (v?.note || '').trim()
    if (title || description || note) out[lng] = { title, description, note }
  }
  return out
}

// Shared create/edit form. lockId disables the id field (editing).
function VoucherForm({ initial, lockId, submitLabel, onSubmit, onCancel, t }) {
  const [form, setForm] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [trOpen, setTrOpen] = useState(false)
  const [trLang, setTrLang] = useState(TRANSLATABLE[0]?.code || 'ko')
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const setTr = (field, v) =>
    setForm((f) => ({ ...f, i18n: { ...f.i18n, [trLang]: { ...f.i18n?.[trLang], [field]: v } } }))
  const tr = form.i18n?.[trLang] || {}
  const translatedCount = Object.keys(cleanI18n(form.i18n)).length
  const submit = async () => {
    if (!String(form.templateId).trim() || !String(form.title).trim()) return
    setBusy(true)
    try {
      await onSubmit({
        templateId: String(form.templateId).trim(),
        title: form.title.trim(),
        category: form.category,
        quantity: Number(form.quantity) || 1,
        validUntil: form.validUntil,
        transferable: form.transferable,
        description: (form.description || '').trim(),
        note: (form.note || '').trim(),
        i18n: cleanI18n(form.i18n),
      })
    } catch {
      /* 403 for operators / validation */
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="space-y-2 rounded-lg border border-brand-100 bg-brand-50/40 p-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <input value={form.templateId} onChange={(e) => set('templateId', e.target.value)} placeholder={t('admin.voucherId')} disabled={lockId} className="input !py-1.5 text-sm disabled:bg-slate-100 disabled:text-slate-400" />
        <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder={t('admin.fieldTitle')} className="input !py-1.5 text-sm" />
        <select value={form.category} onChange={(e) => set('category', e.target.value)} className="input !py-1.5 text-sm">
          {VOUCHER_CATS.map((c) => <option key={c} value={c}>{t(`voucherCat.${c}`)}</option>)}
        </select>
        <input type="number" min="0" value={form.quantity} onChange={(e) => set('quantity', e.target.value)} className="input !py-1.5 text-sm" placeholder={t('admin.quantity')} />
        <input type="date" value={form.validUntil} onChange={(e) => set('validUntil', e.target.value)} className="input !py-1.5 text-sm" />
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={form.transferable} onChange={(e) => set('transferable', e.target.checked)} /> {t('voucher.transferable')}
        </label>
      </div>
      <p className="text-[11px] text-slate-400">{t('admin.englishSource')}</p>
      <textarea value={form.description} onChange={(e) => set('description', e.target.value)} placeholder={t('voucher.aboutThis')} rows={2} className="input resize-none !py-1.5 text-sm" />
      <input value={form.note} onChange={(e) => set('note', e.target.value)} placeholder={t('voucher.onSiteNote')} className="input !py-1.5 text-sm" />

      {/* Per-language translations (optional; blank fields fall back to English) */}
      <div className="rounded-lg border border-slate-200 bg-white">
        <button type="button" onClick={() => setTrOpen((o) => !o)} className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-1.5">
            <Icon name="globe" size={13} /> {t('admin.translations')}
            {translatedCount > 0 && <span className="rounded-full bg-brand-100 px-1.5 text-[10px] text-brand-700">{translatedCount}</span>}
          </span>
          <Icon name={trOpen ? 'chevronDown' : 'chevronRight'} size={14} />
        </button>
        {trOpen && (
          <div className="space-y-2 border-t border-slate-100 p-3">
            <div className="flex flex-wrap gap-1">
              {TRANSLATABLE.map((l) => {
                const has = !!cleanI18n(form.i18n)[l.code]
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setTrLang(l.code)}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${trLang === l.code ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    {l.label}{has ? ' ✓' : ''}
                  </button>
                )
              })}
            </div>
            <input value={tr.title || ''} onChange={(e) => setTr('title', e.target.value)} placeholder={t('admin.fieldTitle')} className="input !py-1.5 text-sm" />
            <textarea value={tr.description || ''} onChange={(e) => setTr('description', e.target.value)} placeholder={t('voucher.aboutThis')} rows={2} className="input resize-none !py-1.5 text-sm" />
            <input value={tr.note || ''} onChange={(e) => setTr('note', e.target.value)} placeholder={t('voucher.onSiteNote')} className="input !py-1.5 text-sm" />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button onClick={submit} disabled={busy} className="btn-primary !px-3 !py-1.5 text-xs disabled:opacity-50">{submitLabel}</button>
        <button onClick={onCancel} className="btn-ghost !px-3 !py-1.5 text-xs text-slate-500">{t('common.cancel')}</button>
      </div>
    </div>
  )
}

function VoucherInventory({ membershipId, t }) {
  const { data, loading, reload } = useAsync(() => api.admin.membershipVouchers(membershipId))
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(null)

  const create = async (f) => {
    await api.admin.createVoucher(membershipId, f)
    setAdding(false)
    reload()
  }
  const saveEdit = async (f) => {
    await api.admin.updateVoucher(f.templateId, f)
    setEditing(null)
    reload()
  }
  const remove = (templateId) => api.admin.deleteVoucher(templateId).catch(() => {}).then(reload)

  if (loading) return <p className="text-xs text-slate-400">{t('admin.loading')}</p>
  const rows = itemsOf(data)
  return (
    <div className="space-y-1.5">
      {rows.map((v) =>
        editing === v.templateId ? (
          <VoucherForm
            key={v.templateId}
            initial={{ templateId: v.templateId, title: v.title, category: v.category || 'other', quantity: v.quantity, validUntil: (v.validUntil || '').slice(0, 10), transferable: !!v.transferable, description: v.description || '', note: v.note || '', i18n: v.i18n || {} }}
            lockId
            submitLabel={t('common.save')}
            onSubmit={saveEdit}
            onCancel={() => setEditing(null)}
            t={t}
          />
        ) : (
          <div key={v.templateId} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-sm">
            <span className="font-medium text-slate-700">{v.title}</span>
            <span className="flex items-center gap-3 text-xs tabular-nums text-slate-500">
              <span>{t('voucher.total')} {v.quantity}</span>
              <span className="text-emerald-600">{t('voucher.available')} {v.available ?? '—'}</span>
              <span>{t('voucher.used')} {v.used ?? 0}</span>
              <button onClick={() => setEditing(v.templateId)} className="font-semibold text-brand-600 hover:underline">{t('admin.edit')}</button>
              <button onClick={() => remove(v.templateId)} aria-label={t('common.delete')} className="rounded p-1 text-slate-300 hover:text-rose-500">
                <Icon name="trash" size={14} />
              </button>
            </span>
          </div>
        ),
      )}

      {adding ? (
        <VoucherForm initial={BLANK_VOUCHER} submitLabel={t('admin.addVoucher')} onSubmit={create} onCancel={() => setAdding(false)} t={t} />
      ) : (
        <button onClick={() => setAdding(true)} className="mt-1 flex items-center gap-1 text-xs font-semibold text-brand-600">
          <Icon name="plus" size={14} /> {t('admin.addVoucher')}
        </button>
      )}
    </div>
  )
}

/* ── Availability (editable rule) ──────────────────────────────────────── */
function AvailabilityTab({ t, lang }) {
  const locale = INTL_LOCALE[lang] || 'en-US'
  const weekdays = useMemo(() => {
    const f = new Intl.DateTimeFormat(locale, { weekday: 'short' })
    return Array.from({ length: 7 }, (_, i) => f.format(new Date(2023, 0, 1 + i)))
  }, [locale])
  const mem = useAsync(() => api.admin.listMemberships())
  const [mId, setMId] = useState('')
  const [vouchers, setVouchers] = useState([])
  const [tplId, setTplId] = useState('')
  const [rule, setRule] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!mId) return setVouchers([])
    api.admin.membershipVouchers(mId).then((r) => setVouchers(itemsOf(r))).catch(() => setVouchers([]))
    setTplId('')
    setRule(null)
  }, [mId])
  useEffect(() => {
    if (!tplId) return setRule(null)
    setSaved(false)
    api.admin.getAvailability(tplId).then(setRule).catch(() => setRule(null))
  }, [tplId])

  if (mem.loading) return <Loading t={t} />
  if (mem.error) return <ErrBlock t={t} onRetry={mem.reload} />
  const memberships = itemsOf(mem.data)

  const toggleDay = (i) =>
    setRule((r) => ({ ...r, daysOfWeek: r.daysOfWeek.includes(i) ? r.daysOfWeek.filter((d) => d !== i) : [...r.daysOfWeek, i].sort() }))
  const save = async () => {
    try {
      await api.admin.setAvailability(tplId, {
        daysOfWeek: rule.daysOfWeek,
        minLeadDays: Number(rule.minLeadDays) || 0,
        maxAdvanceDays: Number(rule.maxAdvanceDays) || 0,
        blackouts: rule.blackouts || [],
      })
      setSaved(true)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-4">
      <HolidaysPanel t={t} lang={lang} />
      <div className="grid gap-3 sm:grid-cols-2">
        <select value={mId} onChange={(e) => setMId(e.target.value)} className="input">
          <option value="">— {t('common.brand')} —</option>
          {memberships.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <select value={tplId} onChange={(e) => setTplId(e.target.value)} className="input" disabled={!vouchers.length}>
          <option value="">— Voucher —</option>
          {vouchers.map((v) => <option key={v.templateId} value={v.templateId}>{v.title}</option>)}
        </select>
      </div>

      {rule && (
        <Panel>
          <div className="space-y-4 p-4">
            <div>
              <p className="mb-2 text-sm font-bold text-slate-700">{t('admin.allowedDays')}</p>
              <div className="flex flex-wrap gap-1.5">
                {weekdays.map((w, i) => (
                  <button
                    key={i}
                    onClick={() => toggleDay(i)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${rule.daysOfWeek.includes(i) ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <span className="mb-1 block font-semibold text-slate-600">{t('admin.leadTime')}</span>
                <input type="number" min="0" value={rule.minLeadDays} onChange={(e) => setRule((r) => ({ ...r, minLeadDays: e.target.value }))} className="input" />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-semibold text-slate-600">{t('admin.bookingWindow')}</span>
                <input type="number" min="0" value={rule.maxAdvanceDays} onChange={(e) => setRule((r) => ({ ...r, maxAdvanceDays: e.target.value }))} className="input" />
              </label>
            </div>
            {rule.blackouts?.length > 0 && (
              <div>
                <p className="mb-1.5 text-sm font-bold text-slate-700">{t('admin.blackouts')}</p>
                <ul className="space-y-1 text-sm text-slate-600">
                  {rule.blackouts.map((b, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Icon name="clock" size={13} className="text-rose-400" />
                      {b.label || b.key} · {formatDate(b.from, lang)} – {formatDate(b.to, lang)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex items-center gap-3">
              <button onClick={save} className="btn-primary !px-4 !py-2 text-sm">{t('admin.saveRule')}</button>
              {saved && <span className="text-sm font-semibold text-emerald-600">{t('admin.ruleSaved')}</span>}
            </div>
          </div>
        </Panel>
      )}
    </div>
  )
}

const HOLIDAY_BLANK = { country: 'vietnam', label: '', from: '', to: '', key: '' }

function HolidaysPanel({ t, lang }) {
  const { data, loading, error, reload } = useAsync(() => api.admin.listHolidays())
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState(HOLIDAY_BLANK)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const create = async () => {
    if (!form.from || !form.to || !form.label.trim()) return
    await api.admin
      .createHoliday({ country: form.country, label: form.label.trim(), from: form.from, to: form.to, key: (form.key || form.label.toLowerCase().replace(/\s+/g, '-')).trim() })
      .catch(() => {})
    setForm(HOLIDAY_BLANK)
    setAdding(false)
    reload()
  }
  const remove = (id) => api.admin.deleteHoliday(id).catch(() => {}).then(reload)
  if (loading || error) return null
  const rows = itemsOf(data)
  return (
    <Panel>
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
        <span className="text-sm font-bold text-slate-700">{t('admin.blackouts')}</span>
        <button onClick={() => setAdding((a) => !a)} className="flex items-center gap-1 text-xs font-semibold text-brand-600">
          <Icon name="plus" size={13} /> {t('admin.addHoliday')}
        </button>
      </div>
      <div className="space-y-1.5 p-3">
        {rows.length === 0 && !adding && <p className="text-xs text-slate-400">{t('admin.empty')}</p>}
        {rows.map((h) => (
          <div key={h.id} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
            <span className="min-w-0">
              <span className="font-medium text-slate-700">{h.label || h.key}</span>
              <span className="ml-2 text-xs text-slate-400">{t(`countries.${h.country}`)} · {formatDate(h.from, lang)} – {formatDate(h.to, lang)}</span>
            </span>
            <button onClick={() => remove(h.id)} aria-label={t('common.delete')} className="rounded p-1 text-slate-300 hover:text-rose-500">
              <Icon name="trash" size={14} />
            </button>
          </div>
        ))}
        {adding && (
          <div className="grid gap-2 rounded-lg border border-brand-100 bg-brand-50/40 p-3 sm:grid-cols-2">
            <select value={form.country} onChange={(e) => set('country', e.target.value)} className="input !py-1.5 text-sm">
              {COUNTRIES.map((c) => <option key={c} value={c}>{t(`countries.${c}`)}</option>)}
            </select>
            <input value={form.label} onChange={(e) => set('label', e.target.value)} placeholder={t('admin.fieldTitle')} className="input !py-1.5 text-sm" />
            <input type="date" value={form.from} onChange={(e) => set('from', e.target.value)} className="input !py-1.5 text-sm" />
            <input type="date" value={form.to} onChange={(e) => set('to', e.target.value)} className="input !py-1.5 text-sm" />
            <div className="flex gap-2 sm:col-span-2">
              <button onClick={create} className="btn-primary !px-3 !py-1.5 text-xs">{t('admin.addHoliday')}</button>
              <button onClick={() => setAdding(false)} className="btn-ghost !px-3 !py-1.5 text-xs text-slate-500">{t('common.cancel')}</button>
            </div>
          </div>
        )}
      </div>
    </Panel>
  )
}

/* ── Members ───────────────────────────────────────────────────────────── */
function MembersTab({ t, lang }) {
  const { data, loading, error, reload } = useAsync(() => api.admin.listUsers())
  const [selected, setSelected] = useState(null)
  if (selected) return <MemberDetail key={selected} id={selected} t={t} lang={lang} onBack={() => setSelected(null)} />
  if (loading) return <Loading t={t} />
  if (error) return <ErrBlock t={t} onRetry={reload} />
  const rows = itemsOf(data)
  if (!rows.length) return <Empty t={t} />
  return (
    <Panel>
      <Table head={[t('admin.requester'), t('partner.memberships'), t('admin.memberSince'), '']}>
        {rows.map((u) => (
          <tr key={u.id} className="cursor-pointer border-t border-slate-100 hover:bg-slate-50" onClick={() => setSelected(u.id)}>
            <Td>
              <p className="font-semibold text-slate-800">{u.name || '—'}</p>
              <p className="text-xs text-slate-400">{u.email}</p>
            </Td>
            <Td className="tabular-nums text-slate-600">{u.membershipsCount ?? 0}</Td>
            <Td className="text-slate-500">{u.createdAt ? formatDate(u.createdAt, lang) : '—'}</Td>
            <Td className="text-right"><Icon name="chevronRight" size={16} className="text-slate-300" /></Td>
          </tr>
        ))}
      </Table>
    </Panel>
  )
}

// One member's full footprint: profile + wallet (memberships / vouchers /
// orders / reservations). Re-fetched per id via the key prop in MembersTab.
function MemberDetail({ id, t, lang, onBack }) {
  const { data, loading, error, reload } = useAsync(() => api.admin.getUser(id))
  if (loading) return <Loading t={t} />
  if (error || !data) return <ErrBlock t={t} onRetry={reload} />
  const u = data
  const memberships = itemsOf(u.memberships)
  const vouchers = itemsOf(u.vouchers)
  const orders = itemsOf(u.orders)
  const reservations = itemsOf(u.reservations)
  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-1 text-sm font-semibold text-brand-600">
        <Icon name="chevronLeft" size={15} /> {t('admin.back')}
      </button>

      <Panel>
        <div className="p-4">
          <p className="text-lg font-extrabold text-slate-900">{u.name || '—'}</p>
          <p className="text-sm text-slate-500">{u.email}</p>
          {u.createdAt && <p className="mt-1 text-xs text-slate-400">{t('admin.memberSince')} · {formatDate(u.createdAt, lang)}</p>}
        </div>
      </Panel>

      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard label={t('partner.memberships')} value={memberships.length} icon="bookmark" tone="brand" />
        <StatCard label={t('admin.vouchersHeld')} value={vouchers.length} icon="tag" tone="slate" />
        <StatCard label={t('admin.tabOrders')} value={orders.length} icon="tag" tone="slate" />
        <StatCard label={t('admin.tabReservations')} value={reservations.length} icon="calendar" tone="slate" />
      </div>

      {orders.length > 0 && (
        <Panel>
          <div className="border-b border-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700">{t('admin.tabOrders')}</div>
          <Table head={[t('common.brand'), t('order.amount'), t('admin.auditAction')]}>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-slate-100">
                <Td className="font-semibold text-slate-800">{membershipName(o.membershipId)}</Td>
                <Td className="tabular-nums">{formatMoney(o.paidAmount, o.currency, lang)}</Td>
                <Td><Badge tone={ORDER_TONE[o.status] || 'slate'}>{t(`order.status${cap(o.status)}`)}</Badge></Td>
              </tr>
            ))}
          </Table>
        </Panel>
      )}

      {reservations.length > 0 && (
        <Panel>
          <div className="border-b border-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700">{t('admin.tabReservations')}</div>
          <Table head={['Voucher', t('reservation.date'), t('admin.auditAction')]}>
            {reservations.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <Td className="font-semibold text-slate-800">{r.title || r.templateId}</Td>
                <Td>{r.date ? formatDate(r.date, lang) : '—'}</Td>
                <Td><Badge tone={RES_TONE[r.status] || 'slate'}>{t(`reservation.status${cap(r.status)}`)}</Badge></Td>
              </tr>
            ))}
          </Table>
        </Panel>
      )}

      {vouchers.length > 0 && (
        <Panel>
          <div className="border-b border-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700">{t('admin.vouchersHeld')}</div>
          <Table head={['Voucher', t('common.brand'), t('admin.auditAction')]}>
            {vouchers.map((v, i) => (
              <tr key={v.id || v.templateId || i} className="border-t border-slate-100">
                <Td className="font-semibold text-slate-800">{v.title || v.templateId}</Td>
                <Td className="text-slate-500">{membershipName(v.membershipId)}</Td>
                <Td>{v.status ? <Badge tone="slate">{v.status}</Badge> : '—'}</Td>
              </tr>
            ))}
          </Table>
        </Panel>
      )}

      {!orders.length && !reservations.length && !vouchers.length && !memberships.length && <Empty t={t} />}
    </div>
  )
}

/* ── Settlement (+ by brand + CSV) ─────────────────────────────────────── */
function SettlementTab({ t, lang }) {
  const { data, loading, error, reload } = useAsync(() => api.admin.settlement())
  if (loading) return <Loading t={t} />
  if (error || !data) return <ErrBlock t={t} onRetry={reload} />
  const s = data
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label={t('order.gmv')} value={formatMoney(s.gmv, s.currency, lang)} icon="tag" tone="brand" />
        <StatCard label={t('order.commission')} value={formatMoney(s.commission, s.currency, lang)} icon="sparkles" tone="emerald" />
        <StatCard label={t('admin.activatedOrders')} value={s.activatedOrderCount ?? 0} icon="check" tone="slate" />
      </div>

      {s.byBrand?.length > 0 && (
        <Panel>
          <div className="border-b border-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700">{t('admin.byBrand')}</div>
          <Table head={[t('common.brand'), t('partner.orders'), t('order.gmv'), t('order.commission')]}>
            {s.byBrand.map((b) => (
              <tr key={b.membershipId} className="border-t border-slate-100">
                <Td className="font-semibold text-slate-800">{membershipName(b.membershipId)}</Td>
                <Td className="tabular-nums text-slate-600">{b.orders}</Td>
                <Td className="tabular-nums">{formatMoney(b.gmv, s.currency, lang)}</Td>
                <Td className="tabular-nums text-slate-600">{formatMoney(b.commission, s.currency, lang)}</Td>
              </tr>
            ))}
          </Table>
        </Panel>
      )}

      <div className="flex flex-wrap gap-2">
        <button onClick={() => downloadCsv('/admin/reports/orders.csv', 'orders.csv')} className="btn-secondary !px-4 !py-2 text-sm">
          <Icon name="arrowRight" size={15} /> {t('admin.downloadCsv')} · {t('admin.tabOrders')}
        </button>
        <button onClick={() => downloadCsv('/admin/reports/settlements.csv', 'settlements.csv')} className="btn-secondary !px-4 !py-2 text-sm">
          <Icon name="arrowRight" size={15} /> {t('admin.downloadCsv')} · {t('admin.tabSettlement')}
        </button>
      </div>
    </div>
  )
}

/* ── Audit log ─────────────────────────────────────────────────────────── */
const AUDIT_TONE = { create: 'emerald', update: 'amber', delete: 'slate', activate: 'brand', deactivate: 'slate' }

function AuditTab({ t, lang }) {
  const { data, loading, error, reload } = useAsync(() => api.admin.auditLogs())
  // Translate a known key, else fall back to the raw backend value (robust to
  // any action/target the backend may add later).
  const labelOr = (key, raw) => {
    if (!raw) return '—'
    const v = t(key)
    return v === key ? raw : v
  }
  if (loading) return <Loading t={t} />
  if (error) return <ErrBlock t={t} onRetry={reload} />
  const rows = itemsOf(data)
  if (!rows.length) return <Empty t={t} />
  return (
    <Panel>
      <Table head={[t('admin.auditTime'), t('admin.auditActor'), t('admin.auditAction'), t('admin.auditTarget')]}>
        {rows.map((a) => (
          <tr key={a.id} className="border-t border-slate-100">
            <Td className="whitespace-nowrap text-slate-500">{a.createdAt ? formatDate(a.createdAt, lang) : '—'}</Td>
            <Td className="text-slate-600">{a.actorEmail || '—'}</Td>
            <Td><Badge tone={AUDIT_TONE[a.action] || 'slate'}>{labelOr(`admin.action_${a.action}`, a.action)}</Badge></Td>
            <Td className="text-right">
              <span className="font-medium text-slate-700">{labelOr(`admin.target_${a.targetType}`, a.targetType)}</span>
              {a.targetId && <span className="ml-1.5 text-xs text-slate-400">{a.targetId}</span>}
            </Td>
          </tr>
        ))}
      </Table>
    </Panel>
  )
}

/* ── Sign-in ───────────────────────────────────────────────────────────── */
function SignIn({ onSignIn, lang, setLang, t }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(false)
  const gisRef = useRef(null)
  useEffect(() => {
    if (isRealGoogleEnabled() && gisRef.current) renderRealGoogleButton(gisRef.current, (p) => onSignIn(p)).catch(() => {})
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
              <Icon name="send" size={16} /> {t('admin.signInCta')} (Google · demo)
            </button>
          )}
          {err && <p className="mt-3 text-xs text-rose-600">{t('admin.loadError')}</p>}
        </div>
      </div>
    </div>
  )
}

/* ── Atoms ─────────────────────────────────────────────────────────────── */
function Panel({ children }) {
  return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">{children}</div>
}
function Table({ head, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {head.map((h, i) => <th key={i} className={`px-4 py-2.5 ${i === head.length - 1 ? 'text-right' : ''}`}>{h}</th>)}
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
  const tones = { amber: 'bg-amber-50 text-amber-700', sky: 'bg-sky-50 text-sky-700', emerald: 'bg-emerald-50 text-emerald-700', brand: 'bg-brand-50 text-brand-700', slate: 'bg-slate-100 text-slate-500' }
  return <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone] || tones.slate}`}>{children}</span>
}
function Advance({ onClick, children }) {
  return <button onClick={onClick} className="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100">{children}</button>
}
function StatCard({ label, value, icon, tone = 'slate' }) {
  const tones = { brand: 'text-brand-700', emerald: 'text-emerald-600', amber: 'text-amber-600', slate: 'text-slate-800' }
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <Icon name={icon} size={18} className="text-slate-300" />
      <p className={`mt-2 text-2xl font-extrabold tabular-nums ${tones[tone]}`}>{value}</p>
      <p className="mt-0.5 text-sm text-slate-400">{label}</p>
    </div>
  )
}
function Loading({ t }) {
  return <p className="py-16 text-center text-sm text-slate-400">{t('admin.loading')}</p>
}
function Empty({ t }) {
  return <EmptyBlock icon="bell" title={t('admin.empty')} />
}
function ErrBlock({ t, onRetry }) {
  return (
    <EmptyBlock icon="bell" title={t('admin.loadError')}>
      <button onClick={onRetry} className="btn-secondary mt-3 !px-4 !py-2 text-sm">{t('admin.refresh')}</button>
    </EmptyBlock>
  )
}
function EmptyBlock({ icon, title, body, children }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-14 text-center">
      <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><Icon name={icon} size={22} /></span>
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
        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"><Icon name={icon} size={22} /></span>
        <h1 className="text-lg font-bold text-slate-900">{title}</h1>
        <p className="mt-1.5 text-sm text-slate-500">{body}</p>
        <div className="mt-4 flex justify-center"><LangToggle lang={lang} setLang={setLang} /></div>
      </div>
    </div>
  )
}
