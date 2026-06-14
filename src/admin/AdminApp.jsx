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
        <div className="p-4">
          <p className="mb-2 text-sm font-bold text-slate-700">{t('partner.byStatus')}</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(d.orders.byStatus).map(([s, n]) => (
              <Badge key={s} tone={ORDER_TONE[s]}>{t(`order.status${cap(s)}`)}: {n}</Badge>
            ))}
          </div>
          <p className="mb-2 mt-4 text-sm font-bold text-slate-700">{t('admin.tabReservations')}</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(d.reservations.byStatus).map(([s, n]) => (
              <Badge key={s} tone={RES_TONE[s]}>{t(`reservation.status${cap(s)}`)}: {n}</Badge>
            ))}
          </div>
          <p className="mb-2 mt-4 text-sm font-bold text-slate-700">{t('admin.tabAssistance')}</p>
          <div className="flex flex-wrap gap-2">
            <Badge tone="amber">{t('admin.statusOpen')}: {d.assistance.open}</Badge>
            <Badge tone="emerald">{t('admin.statusHandled')}: {d.assistance.handled}</Badge>
          </div>
        </div>
      </Panel>
    </div>
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
function CatalogTab({ t, lang }) {
  const { data, loading, error, reload } = useAsync(() => api.admin.listMemberships())
  const [openId, setOpenId] = useState(null)
  if (loading) return <Loading t={t} />
  if (error) return <ErrBlock t={t} onRetry={reload} />
  const rows = itemsOf(data)
  if (!rows.length) return <Empty t={t} />
  return (
    <Panel>
      <Table head={[t('common.brand'), t('common.annualFee'), t('admin.salePrice'), t('admin.commissionRate'), t('common.cities'), '']}>
        {rows.map((m) => (
          <Fragment key={m.id}>
            <tr className="cursor-pointer border-t border-slate-100 hover:bg-slate-50" onClick={() => setOpenId(openId === m.id ? null : m.id)}>
              <Td>
                <p className="font-semibold text-slate-800">{m.name}</p>
                <p className="text-xs text-slate-400">{m.brand}{m.active === false && <span className="ml-2 text-rose-500">· {t('admin.inactive')}</span>}</p>
              </Td>
              <Td className="tabular-nums">{m.annualFee ? formatMoney(m.annualFee, m.currency, lang) : t('common.free')}</Td>
              <Td className="tabular-nums">{m.salePrice != null ? formatMoney(m.salePrice, m.currency, lang) : '—'}</Td>
              <Td className="tabular-nums text-slate-500">{m.commissionRate != null ? `${Math.round(m.commissionRate * 100)}%` : '—'}</Td>
              <Td className="text-slate-500">{(m.cities || []).length}</Td>
              <Td className="text-right"><Icon name="chevronRight" size={16} className={`text-slate-300 transition ${openId === m.id ? 'rotate-90' : ''}`} /></Td>
            </tr>
            {openId === m.id && (
              <tr className="border-t border-slate-100 bg-slate-50/60">
                <td colSpan={6} className="px-4 py-3">
                  <VoucherInventory membershipId={m.id} t={t} lang={lang} />
                </td>
              </tr>
            )}
          </Fragment>
        ))}
      </Table>
    </Panel>
  )
}

const VOUCHER_CATS = ['dining', 'room', 'spa', 'discount', 'gift', 'other']

function VoucherInventory({ membershipId, t }) {
  const { data, loading, reload } = useAsync(() => api.admin.membershipVouchers(membershipId))
  const blank = { templateId: '', title: '', category: 'dining', quantity: 1, validUntil: '2026-12-31', transferable: false }
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState(blank)
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const create = async () => {
    if (!form.templateId.trim() || !form.title.trim()) return
    setBusy(true)
    try {
      await api.admin.createVoucher(membershipId, {
        templateId: form.templateId.trim(),
        title: form.title.trim(),
        category: form.category,
        quantity: Number(form.quantity) || 1,
        validUntil: form.validUntil,
        transferable: form.transferable,
      })
      setForm(blank)
      setAdding(false)
      reload()
    } catch {
      /* 403 for operators / validation */
    } finally {
      setBusy(false)
    }
  }
  const remove = (templateId) => api.admin.deleteVoucher(templateId).catch(() => {}).then(reload)

  if (loading) return <p className="text-xs text-slate-400">{t('admin.loading')}</p>
  const rows = itemsOf(data)
  return (
    <div className="space-y-1.5">
      {rows.map((v) => (
        <div key={v.templateId} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-sm">
          <span className="font-medium text-slate-700">{v.title}</span>
          <span className="flex items-center gap-3 text-xs tabular-nums text-slate-500">
            <span>{t('voucher.total')} {v.quantity}</span>
            <span className="text-emerald-600">{t('voucher.available')} {v.available ?? '—'}</span>
            <span>{t('voucher.used')} {v.used ?? 0}</span>
            <button onClick={() => remove(v.templateId)} aria-label={t('common.delete')} className="rounded p-1 text-slate-300 hover:text-rose-500">
              <Icon name="trash" size={14} />
            </button>
          </span>
        </div>
      ))}

      {adding ? (
        <div className="space-y-2 rounded-lg border border-brand-100 bg-brand-50/40 p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <input value={form.templateId} onChange={(e) => set('templateId', e.target.value)} placeholder={t('admin.voucherId')} className="input !py-1.5 text-sm" />
            <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder={t('admin.fieldTitle')} className="input !py-1.5 text-sm" />
            <select value={form.category} onChange={(e) => set('category', e.target.value)} className="input !py-1.5 text-sm">
              {VOUCHER_CATS.map((c) => <option key={c} value={c}>{t(`voucherCat.${c}`)}</option>)}
            </select>
            <input type="number" min="1" value={form.quantity} onChange={(e) => set('quantity', e.target.value)} className="input !py-1.5 text-sm" placeholder={t('admin.quantity')} />
            <input type="date" value={form.validUntil} onChange={(e) => set('validUntil', e.target.value)} className="input !py-1.5 text-sm" />
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={form.transferable} onChange={(e) => set('transferable', e.target.checked)} /> {t('voucher.transferable')}
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={create} disabled={busy} className="btn-primary !px-3 !py-1.5 text-xs disabled:opacity-50">{t('admin.addVoucher')}</button>
            <button onClick={() => setAdding(false)} className="btn-ghost !px-3 !py-1.5 text-xs text-slate-500">{t('common.cancel')}</button>
          </div>
        </div>
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

/* ── Members ───────────────────────────────────────────────────────────── */
function MembersTab({ t, lang }) {
  const { data, loading, error, reload } = useAsync(() => api.admin.listUsers())
  if (loading) return <Loading t={t} />
  if (error) return <ErrBlock t={t} onRetry={reload} />
  const rows = itemsOf(data)
  if (!rows.length) return <Empty t={t} />
  return (
    <Panel>
      <Table head={[t('admin.requester'), t('partner.memberships'), t('admin.memberSince')]}>
        {rows.map((u) => (
          <tr key={u.id} className="border-t border-slate-100">
            <Td>
              <p className="font-semibold text-slate-800">{u.name || '—'}</p>
              <p className="text-xs text-slate-400">{u.email}</p>
            </Td>
            <Td className="tabular-nums text-slate-600">{u.membershipsCount ?? 0}</Td>
            <Td className="text-slate-500">{u.createdAt ? formatDate(u.createdAt, lang) : '—'}</Td>
          </tr>
        ))}
      </Table>
    </Panel>
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
