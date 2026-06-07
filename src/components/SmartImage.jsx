import { useState } from 'react'
import Icon from './Icon.jsx'

// Image with graceful fallback. Shows a themed gradient + icon underneath; the
// photo fades in on top when it loads. If `src` is empty or fails to load, the
// gradient + icon remain — so the layout never breaks (offline-safe).
export default function SmartImage({
  src,
  alt = '',
  gradient = ['#1b3a5b', '#0f2238'],
  icon = 'bed',
  iconSize = 28,
  className = '',
  rounded = 'rounded-xl2',
}) {
  const [from, to] = gradient
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)

  return (
    <div
      className={`relative overflow-hidden ${rounded} ${className}`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      <div className="absolute inset-0 flex items-center justify-center text-white/75">
        <Icon name={icon} size={iconSize} />
      </div>
      {src && !failed && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          onLoad={() => setLoaded(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  )
}
