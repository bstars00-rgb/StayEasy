import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { useTranslation } from '../i18n/useTranslation.js'
import { memberships } from '../data/memberships.js'
import MembershipCard from '../components/MembershipCard.jsx'
import CitySelector from '../components/CitySelector.jsx'
import CTAButton from '../components/CTAButton.jsx'
import { SectionTitle } from '../components/ui.jsx'
import Icon from '../components/Icon.jsx'

export default function Home() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { city } = useApp()

  const cityName = t(`cities.${city}`)
  const popular = memberships
    .filter((m) => m.cities.includes(city))
    .sort((a, b) => b.scores.overall - a.scores.overall)
    .slice(0, 2)

  return (
    <div className="page-pad space-y-6">
      {/* Hero */}
      <section className="overflow-hidden rounded-xl2 bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-white shadow-card">
        <p className="text-sm font-semibold text-brand-50/90">{t('common.tagline')}</p>
        <h1 className="mt-2 text-2xl font-extrabold leading-snug">{t('home.headline')}</h1>
        <p className="mt-2 text-sm leading-relaxed text-brand-50/90">{t('home.subtitle')}</p>
      </section>

      {/* City selector */}
      <section>
        <p className="mb-2 text-sm font-semibold text-slate-700">{t('home.selectCity')}</p>
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
