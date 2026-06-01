import { useApp } from '../context/AppContext.jsx'
import Icon from './Icon.jsx'

// Global confirmation toast, driven by AppContext.showToast().
export default function Toast() {
  const { toast } = useApp()
  if (!toast) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-2 rounded-2xl bg-slate-900/92 px-4 py-2.5 text-sm font-semibold text-white shadow-cardhover">
        <Icon name="check" size={16} className="text-brand-300" />
        {toast.message}
      </div>
    </div>
  )
}
