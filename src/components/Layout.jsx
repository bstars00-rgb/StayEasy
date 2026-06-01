import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import AppHeader from './AppHeader.jsx'
import BottomNavigation from './BottomNavigation.jsx'
import Toast from './Toast.jsx'
import SignInModal from './SignInModal.jsx'

export default function Layout({ children }) {
  const { pathname } = useLocation()

  // Scroll to top on route change for a native app-like feel.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="app-shell">
      <AppHeader />
      <main className="flex-1">{children}</main>
      <BottomNavigation />
      <Toast />
      <SignInModal />
    </div>
  )
}
