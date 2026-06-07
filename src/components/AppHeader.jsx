import { Link } from 'react-router-dom'
import CitySelector from './CitySelector.jsx'
import LanguageSelector from './LanguageSelector.jsx'
import AccountMenu from './AccountMenu.jsx'

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <Link to="/" className="flex items-baseline gap-0.5">
          <span className="text-xl font-extrabold tracking-tight text-brand-700">Stay</span>
          <span className="text-xl font-extrabold tracking-tight text-gold-600">Easy</span>
        </Link>
        <div className="flex items-center gap-2">
          <CitySelector />
          <LanguageSelector />
          <AccountMenu />
        </div>
      </div>
    </header>
  )
}
