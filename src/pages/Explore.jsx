import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { useTranslation } from '../i18n/useTranslation.js'
import { memberships } from '../data/memberships.js'
import { TAGS } from '../data/memberships.js'
import { cities } from '../data/cities.js'
import MembershipCard from '../components/MembershipCard.jsx'
import EmptyState from '../components/EmptyState.jsx'
import CTAButton from '../components/CTAButton.jsx'

export default function Explore() {
  const { t } = useTranslation()
  const { city, setCity } = useApp()
  const [cityFilter, setCityFilter] = useState(city)
  const [benefit, setBenefit] = useState('all')
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    let list = memberships
    if (cityFilter !== 'all') list = list.filter((m) => m.cities.includes(cityFilter))
    if (benefit !== 'all') list = list.filter((m) => m.bestFor.includes(benefit))
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter((m) =>
        [m.name, m.brand, ...(m.hotels || []), ...(m.benefits || [])]
          .join(' ')
          .toLowerCase()
          .includes(q),
      )
    }
    return [...list].sort((a, b) => b.scores.overall - a.scores.overall)
  }, [cityFilter, benefit, query])

  function onCityChange(value) {
    setCityFilter(value)
    if (value !== 'all') setCity(value) // keep header in sync
  }

  const hasFilters = cityFilter !== 'all' || benefit !== 'all' || query.trim() !== ''
  const clearAll = () => {
    setCityFilter('all')
    setBenefit('all')
    setQuery('')
  }

  return (
    <div className="page-pad space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">{t('explore.title')}</h1>
        <p className="text-sm text-slate-500">{t('explore.subtitle')}</p>
      </div>

      {/* Search */}
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('explore.searchPlaceholder')}
        className="input"
        aria-label={t('explore.searchPlaceholder')}
      />

      {/* Filters */}
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-500">{t('explore.cityFilter')}</span>
          <select value={cityFilter} onChange={(e) => onCityChange(e.target.value)} className="input">
            <option value="all">{t('explore.allCities')}</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {t(`cities.${c.id}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-500">{t('explore.benefitFilter')}</span>
          <select value={benefit} onChange={(e) => setBenefit(e.target.value)} className="input">
            <option value="all">{t('explore.allBenefits')}</option>
            {TAGS.map((tag) => (
              <option key={tag} value={tag}>
                {t(`tags.${tag}`)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{t('explore.results', { count: results.length })}</p>
        {hasFilters && (
          <button onClick={clearAll} className="text-sm font-semibold text-brand-600">
            {t('explore.clearFilters')}
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <EmptyState icon="explore" title={t('explore.empty')}>
          <CTAButton variant="secondary" onClick={clearAll}>
            {t('explore.clearFilters')}
          </CTAButton>
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {results.map((m) => (
            <MembershipCard key={m.id} membership={m} />
          ))}
        </div>
      )}
    </div>
  )
}
