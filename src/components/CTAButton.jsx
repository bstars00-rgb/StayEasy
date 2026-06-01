import Icon from './Icon.jsx'

// Shared call-to-action button with consistent sizing and large tap targets.
// variant: primary | secondary | ghost | outline | whatsapp
const VARIANTS = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600 shadow-sm',
  secondary: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
  ghost: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
  outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
  whatsapp: 'bg-[#25D366] text-white hover:bg-[#1fbe5b] shadow-sm',
}

export default function CTAButton({
  children,
  variant = 'primary',
  icon,
  iconRight,
  fullWidth = false,
  size = 'md',
  className = '',
  ...rest
}) {
  const sizes = { md: 'px-4 py-3 text-sm', lg: 'px-5 py-3.5 text-base' }
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition active:scale-[0.98] disabled:opacity-50 ${
        VARIANTS[variant]
      } ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {icon && <Icon name={icon} size={18} />}
      {children}
      {iconRight && <Icon name={iconRight} size={18} />}
    </button>
  )
}
