import Icon from './Icon.jsx'

export default function EmptyState({ icon = 'sparkles', title, children }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-500">
        <Icon name={icon} size={28} />
      </span>
      {title && <p className="max-w-xs font-semibold text-slate-800">{title}</p>}
      {children}
    </div>
  )
}
