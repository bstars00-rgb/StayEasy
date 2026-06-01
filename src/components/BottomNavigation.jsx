import { NavLink } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { useTranslation } from '../i18n/useTranslation.js'
import Icon from './Icon.jsx'

const items = [
  { to: '/', key: 'home', icon: 'home', end: true },
  { to: '/explore', key: 'explore', icon: 'explore' },
  { to: '/compare', key: 'compare', icon: 'compare' },
  { to: '/my-benefits', key: 'myBenefits', icon: 'bookmark' },
  { to: '/help', key: 'help', icon: 'help' },
]

export default function BottomNavigation() {
  const { t } = useTranslation()
  const { compareIds, savedIds } = useApp()
  const badges = { compare: compareIds.length, myBenefits: savedIds.length }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-slate-100 bg-white/95 backdrop-blur">
      <div className="grid grid-cols-5">
        {items.map((it) => (
          <NavLink
            key={it.key}
            to={it.to}
            end={it.end}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
                isActive ? 'text-brand-600' : 'text-slate-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="relative">
                  <Icon name={it.icon} size={22} strokeWidth={isActive ? 2 : 1.8} />
                  {badges[it.key] > 0 && (
                    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
                      {badges[it.key]}
                    </span>
                  )}
                </span>
                {t(`nav.${it.key}`)}
              </>
            )}
          </NavLink>
        ))}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}
