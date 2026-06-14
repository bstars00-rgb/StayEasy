// Lightweight inline icon set (no icon library dependency).
// Each icon inherits color via `currentColor` and sizes via the `size` prop.

const paths = {
  home: <path d="M3 10.5 12 3l9 7.5M5 9.5V21h5v-6h4v6h5V9.5" />,
  utensils: (
    <>
      <path d="M5 3v7a2 2 0 0 0 4 0V3M7 12v9" />
      <path d="M17 3c-1.7 0-3 2-3 5s1 4 3 4v9" />
    </>
  ),
  bed: (
    <>
      <path d="M3 8v11M3 12h18a0 0 0 0 1 0 0v7M21 19v-5a3 3 0 0 0-3-3H8" />
      <circle cx="6.5" cy="9.5" r="1.5" />
    </>
  ),
  flower: (
    <>
      <circle cx="12" cy="12" r="2.2" />
      <path d="M12 9.8C12 7 13 5 15 5s2 2.5 0 4M12 14.2C12 17 11 19 9 19s-2-2.5 0-4M9.8 12C7 12 5 11 5 9s2.5-2 4 0M14.2 12C17 12 19 13 19 15s-2.5 2-4 0" />
    </>
  ),
  tag: (
    <>
      <path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9z" />
      <circle cx="7.5" cy="7.5" r="1.2" />
    </>
  ),
  gift: (
    <>
      <path d="M4 11h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM3 7h18v4H3zM12 7v14" />
      <path d="M12 7S10.5 3.5 8.5 4 9 7 12 7zM12 7s1.5-3.5 3.5-3 .5 3-3.5 3z" />
    </>
  ),
  dots: (
    <>
      <circle cx="6" cy="12" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="18" cy="12" r="1.4" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v4M16 3v4" />
    </>
  ),
  bell: (
    <>
      <path d="M6 10a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" />
      <path d="M10.5 20a1.7 1.7 0 0 0 3 0" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5" />
      <path d="M16 5.5a3 3 0 0 1 0 5.5M21 20c0-2.5-1.3-4.2-3.5-4.8" />
    </>
  ),
  send: <path d="M22 3 11 14M22 3l-7 19-4-8-8-4z" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  explore: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </>
  ),
  compare: (
    <>
      <path d="M3 6h7M3 12h7M3 18h7" />
      <path d="M14 6h7M14 12h7M14 18h7" />
    </>
  ),
  bookmark: <path d="M6 3h12v18l-6-4-6 4z" />,
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 1-1 1.7" />
      <path d="M12 17h.01" />
    </>
  ),
  chevronRight: <path d="m9 6 6 6-6 6" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronLeft: <path d="m15 6-6 6 6 6" />,
  star: (
    <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" />
  ),
  pin: (
    <>
      <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18" />
    </>
  ),
  history: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 4v4h4M12 8v4l3 2" />
    </>
  ),
  check: <path d="m5 12 4.5 4.5L19 7" />,
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  trash: (
    <>
      <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
    </>
  ),
  ticket: (
    <>
      <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z" />
      <path d="M13 6v12" strokeDasharray="2 2" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  whatsapp: (
    <path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.6-1.2A9 9 0 1 0 12 3z M8.5 8.2c.2-.5.4-.5.7-.5h.5c.2 0 .4 0 .6.5l.7 1.6c.1.2 0 .4-.1.6l-.4.5c-.2.2-.3.4-.1.7.5.9 1.3 1.6 2.2 2 .3.2.5.1.7-.1l.5-.6c.2-.2.4-.2.6-.1l1.5.7c.2.1.3.3.3.5 0 .8-.6 1.5-1.3 1.6-.6.1-1.3.1-3.2-.8-2.4-1.2-3.8-3.7-3.9-3.9-.1-.2-.9-1.4-.9-2.6s.6-1.7.8-1.9z" />
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  sparkles: (
    <path d="M12 4l1.3 3.7L17 9l-3.7 1.3L12 14l-1.3-3.7L7 9l3.7-1.3zM18 14l.7 1.8L20.5 16l-1.8.7L18 18l-.7-1.3L15.5 16l1.8-.2z" />
  ),
  moon: <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 7.5 7.5 0 1 0 20.5 14.5z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
}

export default function Icon({ name, size = 22, className = '', strokeWidth = 1.8, ...rest }) {
  const filled = name === 'star' || name === 'whatsapp' || name === 'sparkles' || name === 'bookmark'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {paths[name]}
    </svg>
  )
}
