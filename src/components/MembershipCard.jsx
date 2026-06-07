import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useTranslation } from '../i18n/useTranslation.js'
import { isPaid } from '../data/memberships.js'
import { membershipPhoto } from '../data/media.js'
import { accentFor } from './brandTheme.js'
import { formatMoney } from '../utils/format.js'
import { BrandAvatar, Chip } from './ui.jsx'
import ScoreBadge from './ScoreBadge.jsx'
import SmartImage from './SmartImage.jsx'
import CTAButton from './CTAButton.jsx'
import Icon from './Icon.jsx'

export default function MembershipCard({ membership: m }) {
  const navigate = useNavigate()
  const { t, lang } = useTranslation()
  const { isSaved, addSaved, showToast } = useApp()
  const { requireAuth } = useAuth()

  const saved = isSaved(m.id)
  const free = m.annualFee === 0

  // Owned → wallet; paid → purchase (on detail); free → join immediately.
  let action
  if (saved) {
    action = { variant: 'secondary', icon: 'check', label: t('purchase.owned'), onClick: () => navigate('/my-benefits') }
  } else if (isPaid(m)) {
    action = { variant: 'primary', icon: 'tag', label: t('purchase.buy'), onClick: () => navigate(`/membership/${m.id}`) }
  } else {
    action = {
      variant: 'primary',
      icon: 'plus',
      label: t('purchase.joinFree'),
      onClick: () =>
        requireAuth(() => {
          addSaved(m)
          showToast(t('common.savedToast'))
        }),
    }
  }

  return (
    <article className="card overflow-hidden">
      {/* Hero photo (falls back to brand gradient) */}
      <div className="relative">
        <SmartImage
          src={membershipPhoto(m.id)}
          alt={m.name}
          gradient={accentFor(m.brand)}
          icon="bed"
          rounded="rounded-none"
          className="h-28 w-full"
        />
        <div className="absolute right-2 top-2">
          <ScoreBadge score={m.scores.overall} className="!bg-white/90 shadow-sm" />
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start gap-3">
          <BrandAvatar membership={m} className="-mt-8 ring-2 ring-white" />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate font-bold text-slate-900">{m.name}</h3>
                <p className="truncate text-xs text-slate-500">
                  {m.brand} · {t(`countries.${m.country}`)}
                </p>
              </div>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {m.cities.slice(0, 3).map((c) => (
                <span key={c} className="inline-flex items-center gap-0.5 text-[11px] font-medium text-slate-500">
                  <Icon name="pin" size={11} className="text-brand-400" />
                  {t(`cities.${c}`)}
                </span>
              ))}
              {m.cities.length > 3 && (
                <span className="text-[11px] font-medium text-slate-400">+{m.cities.length - 3}</span>
              )}
            </div>
          </div>
        </div>

        <p className="mt-3 line-clamp-2 text-sm text-slate-600">{m.benefits[0]}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {m.bestFor.slice(0, 3).map((tag) => (
            <Chip key={tag} tone="slate">
              {t(`tags.${tag}`)}
            </Chip>
          ))}
        </div>

        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-[11px] text-slate-400">{t('common.annualFee')}</p>
            <p className="font-bold text-slate-900">
              {free ? (
                <span className="text-emerald-600">{t('common.free')}</span>
              ) : (
                formatMoney(m.annualFee, m.currency, lang)
              )}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-slate-400">{t('common.estSavingsShort')}</p>
            <p className="font-bold text-brand-600">{formatMoney(m.estimatedSavings, m.currency, lang)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-slate-100 p-3">
        <CTAButton variant="ghost" onClick={() => navigate(`/membership/${m.id}`)}>
          {t('common.viewDetails')}
        </CTAButton>
        <CTAButton variant={action.variant} icon={action.icon} onClick={action.onClick}>
          {action.label}
        </CTAButton>
      </div>
    </article>
  )
}
