import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { useTranslation } from '../i18n/useTranslation.js'
import { getMembership } from '../data/memberships.js'
import { formatMoney } from '../utils/format.js'
import { BrandAvatar, ScoreBar } from '../components/ui.jsx'
import ScoreBadge from '../components/ScoreBadge.jsx'
import EmptyState from '../components/EmptyState.jsx'
import CTAButton from '../components/CTAButton.jsx'
import Icon from '../components/Icon.jsx'

export default function Compare() {
  const navigate = useNavigate()
  const { t, lang } = useTranslation()
  const { compareIds, removeFromCompare, maxCompare, isSaved, addSaved, showToast } = useApp()

  const items = compareIds.map(getMembership).filter(Boolean)

  if (items.length === 0) {
    return (
      <div className="page-pad space-y-4">
        <h1 className="text-xl font-extrabold text-slate-900">{t('compare.title')}</h1>
        <EmptyState icon="compare" title={t('compare.empty')}>
          <CTAButton variant="primary" onClick={() => navigate('/explore')}>
            {t('myBenefits.exploreCta')}
          </CTAButton>
        </EmptyState>
      </div>
    )
  }

  function handleAdd(m) {
    if (isSaved(m.id)) return showToast(t('common.alreadySaved'))
    addSaved(m)
    showToast(t('common.savedToast'))
  }

  const discount = (v) => (v == null ? t('common.memberRate') : `${t('common.upTo')} ${v}%`)
  const yesNo = (b) => (b ? t('detail.included') : t('detail.notIncluded'))

  return (
    <div className="page-pad space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">{t('compare.title')}</h1>
        <p className="text-sm text-slate-500">{t('compare.selectToComparePrompt')}</p>
      </div>

      {/* Side-by-side headline metrics */}
      <div className="-mx-4 overflow-x-auto px-4 no-scrollbar">
        <div className="flex gap-2" style={{ minWidth: 'min-content' }}>
          {items.map((m) => (
            <div key={m.id} className="card w-36 shrink-0 p-3 text-center">
              <div className="flex justify-end">
                <button
                  onClick={() => removeFromCompare(m.id)}
                  className="-mr-1 -mt-1 rounded-full p-1 text-slate-300 hover:text-rose-500"
                  aria-label={t('common.delete')}
                >
                  <Icon name="close" size={15} />
                </button>
              </div>
              <BrandAvatar membership={m} size={40} className="mx-auto" />
              <p className="mt-2 line-clamp-2 text-xs font-bold leading-tight text-slate-800">{m.name}</p>
              <div className="mt-2 flex justify-center">
                <ScoreBadge score={m.scores.overall} />
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-700">
                {m.annualFee === 0 ? t('common.free') : formatMoney(m.annualFee, m.currency, lang)}
              </p>
            </div>
          ))}
          {items.length < maxCompare && (
            <button
              onClick={() => navigate('/explore')}
              className="flex w-36 shrink-0 flex-col items-center justify-center gap-2 rounded-xl2 border-2 border-dashed border-slate-200 p-3 text-slate-400 hover:bg-slate-50"
            >
              <Icon name="plus" size={22} />
              <span className="text-xs font-semibold">{t('compare.addMembership')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Detailed stacked cards */}
      <div className="space-y-3">
        {items.map((m) => (
          <div key={m.id} className="card p-4">
            <div className="flex items-center gap-3">
              <BrandAvatar membership={m} size={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-slate-900">{m.name}</p>
                <p className="truncate text-xs text-slate-500">{m.brand}</p>
              </div>
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
              <Row label={t('common.annualFee')} value={m.annualFee === 0 ? t('common.free') : formatMoney(m.annualFee, m.currency, lang)} />
              <Row label={t('common.estSavingsShort')} value={formatMoney(m.estimatedSavings, m.currency, lang)} />
              <Row label={t('detail.freeNight')} value={yesNo(m.freeNight)} />
              <Row label={t('detail.spaBenefit')} value={yesNo(m.spaBenefit)} />
              <Row label={t('detail.diningDiscount')} value={discount(m.diningDiscount)} />
              <Row label={t('detail.roomDiscount')} value={discount(m.roomDiscount)} />
              <Row label={t('compare.cityCoverage')} value={`${m.cities.length}`} />
            </dl>

            <div className="mt-3 space-y-2.5">
              <ScoreBar label={t('scores.familyDining')} value={m.scores.familyDining} />
              <ScoreBar label={t('scores.staycation')} value={m.scores.staycation} />
              <ScoreBar label={t('scores.businessTravel')} value={m.scores.businessTravel} />
              <ScoreBar label={t('scores.easeOfUse')} value={m.scores.easeOfUse} />
              <ScoreBar label={t('scores.overall')} value={m.scores.overall} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <CTAButton variant="ghost" onClick={() => navigate(`/membership/${m.id}`)}>
                {t('common.viewDetails')}
              </CTAButton>
              <CTAButton
                variant={isSaved(m.id) ? 'secondary' : 'primary'}
                icon={isSaved(m.id) ? 'check' : 'plus'}
                onClick={() => handleAdd(m)}
              >
                {isSaved(m.id) ? t('common.saved') : t('common.addToMyBenefits')}
              </CTAButton>
              <CTAButton variant="outline" icon="help" className="col-span-2" onClick={() => navigate(`/help?membership=${m.id}`)}>
                {t('common.requestAssistance')}
              </CTAButton>
            </div>
          </div>
        ))}
      </div>

      <p className="rounded-xl bg-slate-50 p-3 text-center text-xs text-slate-400">{t('compare.disclaimer')}</p>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="font-semibold text-slate-800">{value}</dd>
    </div>
  )
}
