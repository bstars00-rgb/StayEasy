import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { useTranslation } from '../i18n/useTranslation.js'
import { quizQuestions } from '../data/quiz.js'
import { memberships } from '../data/memberships.js'
import { formatMoney } from '../utils/format.js'
import { BrandAvatar, Chip } from '../components/ui.jsx'
import ScoreBadge from '../components/ScoreBadge.jsx'
import CTAButton from '../components/CTAButton.jsx'
import Icon from '../components/Icon.jsx'

// Rough conversion of an annual fee to USD so budget answers compare fairly.
const TO_USD = { VND: 1 / 24000, KRW: 1 / 1350, THB: 1 / 36, JPY: 1 / 150, USD: 1 }
const feeUSD = (m) => m.annualFee * (TO_USD[m.currency] || 1)

// Returns memberships ranked for the given answers, with reason tags.
// Reasons are { key, vars } pairs translated at render time.
function rank(answers) {
  const { city, benefit, frequency = 0, companion, fee = 9999 } = answers
  return memberships
    .map((m) => {
      let score = m.scores.overall * 0.5
      const reasons = []

      if (city && m.cities.includes(city)) {
        score += 25
        reasons.push({ key: 'quiz.reasonCity', vars: { city: `cities.${city}` } })
      }
      if (benefit && m.bestFor.includes(benefit)) {
        score += 25
        reasons.push({ key: 'quiz.reasonBenefit', vars: { benefit: `tags.${benefit}` } })
      }
      if (benefit === 'freeNight' && m.freeNight) {
        score += 12
        reasons.push({ key: 'quiz.reasonFreeNight' })
      }
      if (benefit === 'spa' && m.spaBenefit) {
        score += 10
        reasons.push({ key: 'quiz.reasonSpa' })
      }

      // Dining usage frequency rewards programs with stronger dining discounts.
      score += frequency * ((m.diningDiscount || 0) / 12)

      if (companion === 'family') {
        score += m.scores.familyDining * 0.2
        if (m.scores.familyDining >= 85) reasons.push({ key: 'quiz.reasonFamily' })
      } else if (companion === 'business') {
        score += m.scores.businessTravel * 0.2
        if (m.scores.businessTravel >= 85) reasons.push({ key: 'quiz.reasonBusiness' })
      } else {
        score += m.scores.staycation * 0.2
        if (m.scores.staycation >= 85) reasons.push({ key: 'quiz.reasonCouple' })
      }

      // Budget: penalize anything above the stated willingness.
      const usd = feeUSD(m)
      if (usd > fee) {
        score -= 45
      } else if (m.annualFee > 0) {
        reasons.push({ key: 'quiz.reasonBudget' })
      }

      if (reasons.length === 0) reasons.push({ key: 'quiz.reasonTopValue' })

      return { membership: m, score, reasons: reasons.slice(0, 3) }
    })
    .sort((a, b) => b.score - a.score)
}

export default function Quiz() {
  const navigate = useNavigate()
  const { t, lang } = useTranslation()
  const { isSaved, addSaved, showToast } = useApp()

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})

  const total = quizQuestions.length
  const finished = step >= total
  const results = useMemo(() => (finished ? rank(answers).slice(0, 3) : []), [finished, answers])

  function choose(q, value) {
    setAnswers((prev) => ({ ...prev, [q.id]: value }))
    setStep((s) => s + 1)
  }

  function restart() {
    setAnswers({})
    setStep(0)
  }

  function handleAdd(m) {
    if (isSaved(m.id)) return showToast(t('common.alreadySaved'))
    addSaved(m)
    showToast(t('common.savedToast'))
  }

  // --- Results view ---
  if (finished) {
    return (
      <div className="page-pad space-y-5">
        <div className="text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-500">
            <Icon name="sparkles" size={28} />
          </span>
          <h1 className="mt-3 text-xl font-extrabold text-slate-900">{t('quiz.resultTitle')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('quiz.resultSubtitle')}</p>
        </div>

        {results.map(({ membership: m, reasons }, i) => (
          <div key={m.id} className="card overflow-hidden">
            <div className="flex items-center gap-3 p-4">
              <div className="relative">
                <BrandAvatar membership={m} size={48} />
                <span className="absolute -left-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
                  {i + 1}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-slate-900">{m.name}</p>
                <p className="truncate text-xs text-slate-500">{m.brand}</p>
              </div>
              <ScoreBadge score={m.scores.overall} />
            </div>

            <div className="space-y-3 px-4 pb-4">
              <div>
                <p className="mb-1 text-xs font-semibold text-slate-400">{t('quiz.whyRecommended')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {reasons.map((r, idx) => (
                    <Chip key={idx} tone="green">
                      <Icon name="check" size={12} />
                      {t(r.key, r.vars ? mapVars(r.vars, t) : undefined)}
                    </Chip>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold text-slate-400">{t('quiz.bestMatchingBenefits')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {m.bestFor.slice(0, 3).map((tag) => (
                    <Chip key={tag} tone="slate">
                      {t(`tags.${tag}`)}
                    </Chip>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-brand-50 px-3 py-2">
                <span className="text-xs font-semibold text-brand-700">{t('common.estimatedSavings')}</span>
                <span className="font-bold text-brand-700">{formatMoney(m.estimatedSavings, m.currency, lang)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
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
          </div>
        ))}

        <CTAButton variant="ghost" fullWidth icon="sparkles" onClick={restart}>
          {t('quiz.retake')}
        </CTAButton>
      </div>
    )
  }

  // --- Question view ---
  const q = quizQuestions[step]
  const progress = ((step + 1) / total) * 100

  return (
    <div className="page-pad space-y-5">
      <div>
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-400">
          <span>{t('quiz.title')}</span>
          <span>{t('quiz.progress', { current: step + 1, total })}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {step === 0 && <p className="text-sm text-slate-500">{t('quiz.intro')}</p>}

      <h1 className="text-xl font-extrabold text-slate-900">{t(q.labelKey)}</h1>

      <div className="space-y-2.5">
        {q.options.map((opt) => (
          <button
            key={String(opt.value)}
            onClick={() => choose(q, opt.value)}
            className="card flex w-full items-center justify-between p-4 text-left font-semibold text-slate-800 transition hover:border-brand-300 hover:shadow-cardhover"
          >
            {t(opt.labelKey)}
            <Icon name="chevronRight" size={18} className="text-slate-300" />
          </button>
        ))}
      </div>

      {step > 0 && (
        <CTAButton variant="ghost" fullWidth icon="chevronLeft" onClick={() => setStep((s) => s - 1)}>
          {t('common.previous')}
        </CTAButton>
      )}
    </div>
  )
}

// Reason vars may reference another translation key (e.g. a city or tag);
// resolve those nested keys before interpolation.
function mapVars(vars, t) {
  const out = {}
  for (const [k, v] of Object.entries(vars)) {
    out[k] = typeof v === 'string' && v.includes('.') ? t(v) : v
  }
  return out
}
