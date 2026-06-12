import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import SiteApp from './SiteApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SiteApp />
  </StrictMode>,
)
