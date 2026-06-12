import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { useTranslation } from '../i18n/useTranslation.js'
import { memberships, getMembership } from '../data/memberships.js'
import { cities } from '../data/cities.js'
import { getVoucherPack } from '../data/voucherPacks.js'
import { daysUntil, formatDate } from '../utils/format.js'
import { getCurrentPosition, nearestCity } from '../utils/geo.js'
import MembershipCard from '../components/MembershipCard.jsx'
import CitySelector from '../components/CitySelector.jsx'
import CTAButton from '../components/CTAButton.jsx'
import { SectionTitle } from '../components/ui.jsx'
import Icon from '../components/Icon.jsx'

export default function Home() {
  const navigate = useNavigate()
  const { t, lang } = useTranslation()
  const { city, setCity, savedIds, reservations, getVoucherStats, orders, showToast } = useApp()
  const [locating, setLocating] = useState(false)

  // Location-based recommendation: find the nearest supported city.
  const detectLocation = async () => {
    setLocating(true)
    try {
      const pos = await getCurrentPosition()
      const near = nearestCity(pos, cities)
      if (near) {
        setCity(near.id)
        showToast(t('home.nearMeResult', { city: t(`cities.${near.id}`) }))
      } else {
        showToast(t('home.locationDenied'))
      }
    } catch {
      showToast(t('home.locationDenied'))
    } finally {
      setLocating(false)
    }
  }

  const cityName = t(`cities.${city}`)
  const popular = memberships
    .filter((m) => m.cities.includes(city))
    .sort((a, b) => b.scores.overall - a.scores.overall)
    .slice(0, 2)

  // Alerts: vouchers expiring within 30 days + in-progress reservations.
  const owned = savedIds.map(getMembership).filter(Boolean)
  const expiringAlerts = owned
    .flatMap((m) => getVoucherPack(m.id).map((tpl) => ({ m, tpl })))
    .filter(({ m, tpl }) => {
      const avail = getVoucherStats(m.id, tpl).available
      const d = daysUntil(tpl.validUntil)
      return avail > 0 && d != null && d >= 0 && d <= 30
    })
    .map(({ tpl }) => ({
      kind: 'expiring',
      key: `e-${tpl.templateId}`,
      text: t('alerts.expiring', { title: tpl.title, date: formatDate(tpl.validUntil, lang) }),
    }))
  const pendingAlerts = reservations
    .filter((r) => r.status === 'requested' || r.status === 'confirmed')
    .map((r) => ({
      kind: 'pending',
      key: `p-${r.id}`,
      text: t('alerts.pending', { title: r.title, status: t(`reservation.status${r.status[0].toUpperCase()}${r.status.slice(1)}`) }),
    }))
  const orderAlerts = orders
    .filter((o) => o.status !== 'activated' && o.status !== 'cancelled')
    .map((o) => {
      const m = getMembership(o.membershipId)
      return {
        kind: 'order',
        key: `o-${o.id}`,
        text: t('alerts.pending', { title: m?.name || o.membershipId, status: t(`order.status${o.status[0].toUpperCase()}${o.status.slice(1)}`) }),
      }
    })
  const alerts = [...orderAlerts, ...expiringAlerts, ...pendingAlerts].slice(0, 5)

  return (
    <div className="page-pad space-y-6">
      {/* Hero */}
      <section className="overflow-hidden rounded-xl2 bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-white shadow-card">
        <p className="text-sm font-semibold text-brand-50/90">{t('common.tagline')}</p>
        <h1 className="mt-2 text-hero">{t('home.headline')}</h1>
        <p className="mt-2 text-sm leading-relaxed text-brand-50/90">{t('home.subtitle')}</p>
      </section>

      {/* Alerts */}
      {alerts.length > 0 && (
        <section className="rounded-xl2 border border-amber-200 bg-amber-50/60 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Icon name="bell" size={18} className="text-amber-600" />
            <h2 className="text-sm font-bold text-amber-800">{t('alerts.title')}</h2>
          </div>
          <ul className="space-y-1.5">
            {alerts.map((a) => (
              <li key={a.key} className="flex items-start gap-2 text-sm text-amber-900">
                <Icon name={a.kind === 'expiring' ? 'clock' : a.kind === 'order' ? 'tag' : 'calendar'} size={15} className="mt-0.5 shrink-0 text-amber-500" />
                {a.text}
              </li>
            ))}
          </ul>
          <button onClick={() => navigate('/my-benefits')} className="mt-3 text-sm font-semibold text-amber-800 underline">
            {t('nav.myBenefits')}
          </button>
        </section>
      )}

      {/* City selector + location-based recommendation */}
      <section>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-slate-700">{t('home.selectCity')}</p>
          <button
            onClick={detectLocation}
            disabled={locating}
            className="flex items-center gap-1 text-sm font-semibold text-brand-600 disabled:opacity-50"
          >
            <Icon name="pin" size={15} />
            {locating ? t('home.locating') : t('home.nearMe')}
          </button>
        </div>
        <CitySelector compact={false} />
      </section>

      {/* CTAs */}
      <section className="grid grid-cols-1 gap-2.5">
        <CTAButton size="lg" icon="explore" iconRight="chevronRight" fullWidth onClick={() => navigate('/explore')}>
          {t('home.findMemberships')}
        </CTAButton>
        <div className="grid grid-cols-2 gap-2.5">
          <CTAButton variant="secondary" icon="bookmark" onClick={() => navigate('/my-benefits')}>
            {t('home.checkMyBenefits')}
          </CTAButton>
          <CTAButton variant="secondary" icon="sparkles" onClick={() => navigate('/quiz')}>
            {t('home.takeQuiz')}
          </CTAButton>
        </div>
      </section>

      {/* Featured */}
      <section>
        <SectionTitle
          action={
            <button onClick={() => navigate('/explore')} className="text-sm font-semibold text-brand-600">
              {t('common.seeAll')}
            </button>
          }
        >
          {t('home.popularIn', { city: cityName })}
        </SectionTitle>
        {popular.length > 0 ? (
          <div className="space-y-3">
            {popular.map((m) => (
              <MembershipCard key={m.id} membership={m} />
            ))}
          </div>
        ) : (
          <div className="card flex items-center gap-3 p-4 text-sm text-slate-500">
            <Icon name="explore" size={20} className="text-slate-300" />
            {t('explore.empty')}
          </div>
        )}
      </section>
    </div>
  )
}
