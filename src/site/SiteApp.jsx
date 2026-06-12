import { useState } from 'react'
import { memberships } from '../data/memberships.js'
import { formatMoney } from '../utils/format.js'
import Icon from '../components/Icon.jsx'

const BASE = import.meta.env.BASE_URL || '/'
const APP_URL = BASE
const ADMIN_URL = `${BASE}admin/`
const PARTNER_EMAIL = 'Global_OPs@ohmyhotel.com'
// Fill these with the real store listings when published. Empty = "coming soon".
const IOS_URL = ''
const ANDROID_URL = ''

const BRANDS = [...new Set(memberships.map((m) => m.brand))]
const FEATURED = ['club-marriott-vietnam', 'accor-plus-vietnam', 'lotte-hotel-rewards']
  .map((id) => memberships.find((m) => m.id === id))
  .filter(Boolean)

const COPY = {
  ko: {
    lang: 'KO',
    navBenefits: '혜택',
    navHow: '이용 방법',
    navMemberships: '멤버십',
    navPartner: '호텔 제휴',
    openApp: '앱 열기',
    badge: 'by Ohmyhotel · 엄선된 호텔 혜택',
    heroTitle: '엄선된 호텔 멤버십 혜택을\n한 곳에서.',
    heroSub: '오마이호텔이 고른 프리미엄 호텔 멤버십·바우처·다이닝·스파·객실 혜택을 발견하고, 비교하고, 관리하고, 사용하세요.',
    ctaPrimary: '앱 다운로드',
    ctaSecondary: '호텔 제휴 문의',
    dlTitle: '앱 다운로드',
    dlSub: '모바일에서 OhmySelect를 만나보세요.',
    dlComingSoon: '출시 예정',
    dlUseWeb: '웹 버전으로 바로 시작하기',
    dlClose: '닫기',
    stat1: '엄선 멤버십', stat1v: '8',
    stat2: '주요 도시', stat2v: '6',
    stat3: '지원 언어', stat3v: '5',
    trust: '함께하는 호텔 브랜드',
    valuesTitle: '왜 OhmySelect인가',
    valuesSub: '단순 예약 앱이 아니라, 선별된 호텔 혜택 플랫폼입니다.',
    v1t: '엄선된 호텔 혜택', v1d: '오마이호텔이 검증한 멤버십만 골라, 가치 높은 혜택을 추천합니다.',
    v2t: '혜택 지갑 + 만료 알림', v2d: '보유 바우처를 카테고리별로 관리하고, 만료 임박을 미리 알려드립니다.',
    v3t: '컨시어지 예약 요청', v3d: '복잡한 예약은 OhmySelect가 호텔과 직접 조율해 드립니다.',
    v4t: '한눈에 멤버십 비교', v4d: '도시·혜택·가치를 나란히 비교해 나에게 맞는 멤버십을 고르세요.',
    howTitle: '이용 방법',
    h1t: '발견', h1d: '도시별로 엄선된 호텔 멤버십을 둘러봅니다.',
    h2t: '비교', h2d: '혜택과 예상 절약액을 나란히 비교합니다.',
    h3t: '가입·구매', h3d: '결제는 호텔 브랜드 인보이스로, OhmySelect가 절차를 도와드립니다.',
    h4t: '사용·관리', h4d: '바우처를 지갑에서 관리하고 예약을 요청합니다.',
    memTitle: '추천 호텔 혜택',
    memSub: '도시에서 바로 누릴 수 있는 엄선 멤버십.',
    perYear: '/ 년',
    estSaving: '예상 연간 절약',
    viewAll: '앱에서 전체 보기',
    partnerTitle: '호텔 파트너이신가요?',
    partnerSub: 'OhmySelect와 함께 멤버십 혜택을 더 많은 고객에게 전하세요. 결제는 브랜드 인보이스로, 운영은 OhmySelect가 함께합니다.',
    partnerCta: '제휴 문의하기',
    finalTitle: '지금, 호텔 혜택을 더 쉽게.',
    finalSub: '발견하고, 비교하고, 사용하세요 — OhmySelect.',
    footerTagline: '엄선된 호텔 멤버십 혜택 플랫폼',
    footerProduct: '서비스',
    footerApp: '앱 바로가기',
    footerAdmin: '관리자',
    footerCompany: '회사',
    footerContact: '문의',
    rights: 'OhmySelect by Ohmyhotel. All rights reserved.',
  },
  en: {
    lang: 'EN',
    navBenefits: 'Benefits',
    navHow: 'How it works',
    navMemberships: 'Memberships',
    navPartner: 'For hotels',
    openApp: 'Open app',
    badge: 'by Ohmyhotel · Selected hotel benefits',
    heroTitle: 'Selected hotel membership\nbenefits, all in one place.',
    heroSub: 'Discover, compare, manage and use premium hotel memberships, vouchers, dining, spa and room perks — curated by Ohmyhotel.',
    ctaPrimary: 'Download app',
    ctaSecondary: 'Partner with us',
    dlTitle: 'Download the app',
    dlSub: 'Get OhmySelect on your phone.',
    dlComingSoon: 'Coming soon',
    dlUseWeb: 'Use the web version',
    dlClose: 'Close',
    stat1: 'Curated memberships', stat1v: '8',
    stat2: 'Key cities', stat2v: '6',
    stat3: 'Languages', stat3v: '5',
    trust: 'Hotel brands we work with',
    valuesTitle: 'Why OhmySelect',
    valuesSub: 'Not just a booking app — a curated hotel-benefit platform.',
    v1t: 'Selected hotel benefits', v1d: 'Only memberships vetted by Ohmyhotel, recommending the highest-value perks.',
    v2t: 'Benefit wallet + alerts', v2d: 'Manage your vouchers by category and get notified before they expire.',
    v3t: 'Concierge requests', v3d: 'Leave the booking to us — OhmySelect arranges it with the hotel.',
    v4t: 'Compare at a glance', v4d: 'Compare cities, benefits and value side by side to find your fit.',
    howTitle: 'How it works',
    h1t: 'Discover', h1d: 'Browse curated hotel memberships by city.',
    h2t: 'Compare', h2d: 'Compare perks and estimated savings side by side.',
    h3t: 'Join / buy', h3d: 'Payment is via the hotel brand invoice; OhmySelect handles the flow.',
    h4t: 'Use & manage', h4d: 'Manage vouchers in your wallet and request bookings.',
    memTitle: 'Selected hotel benefits',
    memSub: 'Curated memberships you can enjoy in the city.',
    perYear: '/ yr',
    estSaving: 'Est. annual savings',
    viewAll: 'See all in the app',
    partnerTitle: 'Are you a hotel partner?',
    partnerSub: 'Bring your membership benefits to more guests with OhmySelect. Payment stays on your brand invoice; we handle operations together.',
    partnerCta: 'Contact us',
    finalTitle: 'Hotel benefits, made easier.',
    finalSub: 'Discover, compare, and use — OhmySelect.',
    footerTagline: 'Curated hotel membership benefit platform',
    footerProduct: 'Product',
    footerApp: 'Open the app',
    footerAdmin: 'Admin',
    footerCompany: 'Company',
    footerContact: 'Contact',
    rights: 'OhmySelect by Ohmyhotel. All rights reserved.',
  },
}

const VALUE_ICONS = ['sparkles', 'ticket', 'calendar', 'compare']
const HOW_ICONS = ['explore', 'compare', 'tag', 'bookmark']

export default function SiteApp() {
  const [lang, setLang] = useState('ko')
  const [download, setDownload] = useState(false)
  const t = COPY[lang]
  const openDownload = () => setDownload(true)

  return (
    <div className="min-h-screen bg-ivory font-sans text-brand-900">
      <Nav t={t} lang={lang} setLang={setLang} />
      <Hero t={t} onDownload={openDownload} />
      <Brands t={t} />
      <Values t={t} />
      <How t={t} />
      <Featured t={t} lang={lang} />
      <Partner t={t} />
      <FinalCTA t={t} onDownload={openDownload} />
      <Footer t={t} />
      <DownloadModal open={download} onClose={() => setDownload(false)} t={t} />
    </div>
  )
}

function Wordmark({ light }) {
  return (
    <span className="flex items-baseline gap-0.5 text-xl font-extrabold tracking-tight">
      <span className={light ? 'text-white' : 'text-brand-800'}>Ohmy</span>
      <span className="text-gold-500">Select</span>
    </span>
  )
}

function Nav({ t, lang, setLang }) {
  return (
    <header className="sticky top-0 z-40 border-b border-beige/70 bg-ivory/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
        <a href="#top"><Wordmark /></a>
        <nav className="hidden items-center gap-7 text-sm font-semibold text-brand-700 md:flex">
          <a href="#benefits" className="hover:text-brand-900">{t.navBenefits}</a>
          <a href="#how" className="hover:text-brand-900">{t.navHow}</a>
          <a href="#memberships" className="hover:text-brand-900">{t.navMemberships}</a>
          <a href="#partner" className="hover:text-brand-900">{t.navPartner}</a>
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
            className="rounded-full border border-beige px-2.5 py-1.5 text-xs font-bold text-brand-600 hover:bg-beige/40"
          >
            {lang === 'ko' ? 'EN' : 'KO'}
          </button>
          <a href={APP_URL} className="rounded-full bg-brand-800 px-4 py-2 text-sm font-bold text-white hover:bg-brand-900">
            {t.openApp}
          </a>
        </div>
      </div>
    </header>
  )
}

function Hero({ t, onDownload }) {
  return (
    <section id="top" className="relative overflow-hidden bg-brand-900 text-white">
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gold-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-brand-500/30 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-5 py-20 sm:py-28">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-400/40 bg-white/5 px-3 py-1 text-xs font-semibold text-gold-100">
          <Icon name="sparkles" size={13} /> {t.badge}
        </span>
        <h1 className="mt-6 max-w-3xl whitespace-pre-line text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl">
          {t.heroTitle}
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-ivory/80 sm:text-lg">{t.heroSub}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button onClick={onDownload} className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-6 py-3 text-sm font-bold text-brand-900 shadow-lg shadow-gold-500/20 hover:bg-gold-400">
            <Icon name="bookmark" size={16} /> {t.ctaPrimary}
          </button>
          <a href={`mailto:${PARTNER_EMAIL}`} className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-bold text-white hover:bg-white/10">
            {t.ctaSecondary}
          </a>
        </div>
        <div className="mt-12 flex max-w-md gap-8">
          {[[t.stat1v, t.stat1], [t.stat2v, t.stat2], [t.stat3v, t.stat3]].map(([v, l]) => (
            <div key={l}>
              <p className="text-3xl font-extrabold tabular-nums text-gold-300">{v}</p>
              <p className="mt-1 text-xs text-ivory/60">{l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Brands({ t }) {
  return (
    <section className="border-b border-beige/60 bg-ivory">
      <div className="mx-auto max-w-6xl px-5 py-8">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-brand-400">{t.trust}</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {BRANDS.map((b) => (
            <span key={b} className="text-base font-bold tracking-tight text-brand-700/70">{b}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

function Values({ t }) {
  const items = [
    [t.v1t, t.v1d], [t.v2t, t.v2d], [t.v3t, t.v3d], [t.v4t, t.v4d],
  ]
  return (
    <section id="benefits" className="mx-auto max-w-6xl px-5 py-20">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">{t.valuesTitle}</h2>
        <p className="mt-3 text-brand-600">{t.valuesSub}</p>
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(([title, desc], i) => (
          <div key={title} className="rounded-3xl border border-beige bg-white p-6 transition hover:shadow-xl hover:shadow-brand-900/5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <Icon name={VALUE_ICONS[i]} size={20} />
            </span>
            <h3 className="mt-4 text-lg font-bold text-brand-900">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-brand-600">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function How({ t }) {
  const steps = [
    [t.h1t, t.h1d], [t.h2t, t.h2d], [t.h3t, t.h3d], [t.h4t, t.h4d],
  ]
  return (
    <section id="how" className="bg-brand-900 text-white">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t.howTitle}</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(([title, desc], i) => (
            <div key={title} className="relative rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-500/20 text-gold-300">
                  <Icon name={HOW_ICONS[i]} size={18} />
                </span>
                <span className="text-sm font-bold text-gold-300">0{i + 1}</span>
              </div>
              <h3 className="mt-4 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ivory/70">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Featured({ t, lang }) {
  return (
    <section id="memberships" className="mx-auto max-w-6xl px-5 py-20">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">{t.memTitle}</h2>
          <p className="mt-3 text-brand-600">{t.memSub}</p>
        </div>
        <a href={APP_URL} className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:text-brand-900">
          {t.viewAll} <Icon name="arrowRight" size={16} />
        </a>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {FEATURED.map((m) => (
          <a key={m.id} href={`${APP_URL}membership/${m.id}`} className="group flex flex-col overflow-hidden rounded-3xl border border-beige bg-white transition hover:shadow-xl hover:shadow-brand-900/5">
            <div className="relative flex h-32 items-end bg-gradient-to-br from-brand-700 to-brand-900 p-5">
              <div className="pointer-events-none absolute right-4 top-4 h-16 w-16 rounded-full bg-gold-500/20 blur-xl" />
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white">{m.brand}</span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="text-lg font-bold text-brand-900 group-hover:text-brand-700">{m.name}</h3>
              <p className="mt-1 text-sm text-brand-500">
                <Icon name="pin" size={13} className="-mt-0.5 mr-1 inline" />
                {m.cities.length} {lang === 'ko' ? '개 도시' : 'cities'}
              </p>
              <div className="mt-4 flex items-end justify-between border-t border-beige pt-4">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-brand-400">{t.estSaving}</p>
                  <p className="text-lg font-extrabold tabular-nums text-gold-600">
                    {formatMoney(m.estimatedSavings, m.currency, lang)}
                  </p>
                </div>
                <span className="text-sm font-bold text-brand-700">
                  {m.annualFee === 0 ? (lang === 'ko' ? '무료' : 'Free') : `${formatMoney(m.annualFee, m.currency, lang)}${t.perYear}`}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}

function Partner({ t }) {
  return (
    <section id="partner" className="mx-auto max-w-6xl px-5 pb-20">
      <div className="overflow-hidden rounded-[2rem] border border-gold-100 bg-gradient-to-br from-ivory to-beige/60 p-8 sm:p-12">
        <div className="max-w-2xl">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500/15 text-gold-700">
            <Icon name="sparkles" size={22} />
          </span>
          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-brand-900">{t.partnerTitle}</h2>
          <p className="mt-3 text-brand-600">{t.partnerSub}</p>
          <a href={`mailto:${PARTNER_EMAIL}`} className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-800 px-6 py-3 text-sm font-bold text-white hover:bg-brand-900">
            <Icon name="mail" size={16} /> {t.partnerCta}
          </a>
        </div>
      </div>
    </section>
  )
}

function FinalCTA({ t, onDownload }) {
  return (
    <section className="bg-brand-900 text-white">
      <div className="mx-auto max-w-6xl px-5 py-20 text-center">
        <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">{t.finalTitle}</h2>
        <p className="mt-3 text-ivory/70">{t.finalSub}</p>
        <button onClick={onDownload} className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold-500 px-7 py-3.5 text-sm font-bold text-brand-900 hover:bg-gold-400">
          <Icon name="bookmark" size={17} /> {t.ctaPrimary}
        </button>
      </div>
    </section>
  )
}

function Footer({ t }) {
  return (
    <footer className="bg-brand-900 text-ivory/70">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-3">
        <div>
          <Wordmark light />
          <p className="mt-3 max-w-xs text-sm text-ivory/50">{t.footerTagline}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-ivory/40">{t.footerProduct}</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href={APP_URL} className="hover:text-white">{t.footerApp}</a></li>
            <li><a href={ADMIN_URL} className="hover:text-white">{t.footerAdmin}</a></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-ivory/40">{t.footerCompany}</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href={`mailto:${PARTNER_EMAIL}`} className="hover:text-white">{t.footerContact}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-5 py-5 text-xs text-ivory/40">© 2026 {t.rights}</p>
      </div>
    </footer>
  )
}

function DownloadModal({ open, onClose, t }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-brand-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t.dlTitle}
    >
      <div className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-lg font-bold text-brand-900">{t.dlTitle}</h3>
          <button onClick={onClose} aria-label={t.dlClose} className="rounded-full p-1.5 text-brand-400 hover:bg-beige/40">
            <Icon name="close" size={20} />
          </button>
        </div>
        <p className="text-sm text-brand-500">{t.dlSub}</p>
        <div className="mt-5 grid gap-3">
          <StoreButton href={IOS_URL} mark={<AppleMark />} top="Download on the" name="App Store" comingSoon={t.dlComingSoon} />
          <StoreButton href={ANDROID_URL} mark={<PlayMark />} top="GET IT ON" name="Google Play" comingSoon={t.dlComingSoon} />
        </div>
        <a href={APP_URL} className="mt-4 flex items-center justify-center gap-1.5 text-sm font-bold text-brand-700 hover:text-brand-900">
          {t.dlUseWeb} <Icon name="arrowRight" size={15} />
        </a>
      </div>
    </div>
  )
}

function StoreButton({ href, mark, top, name, comingSoon }) {
  const live = !!href
  const inner = (
    <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${live ? 'border-brand-800 bg-brand-900 text-white hover:bg-brand-800' : 'border-beige bg-ivory text-brand-400'}`}>
      <span className="shrink-0">{mark}</span>
      <span className="min-w-0 flex-1 text-left leading-tight">
        <span className="block text-[10px] uppercase tracking-wide opacity-70">{top}</span>
        <span className="block text-base font-bold">{name}</span>
      </span>
      {!live && <span className="shrink-0 rounded-full bg-beige px-2 py-0.5 text-[11px] font-semibold text-brand-500">{comingSoon}</span>}
    </div>
  )
  return live ? (
    <a href={href} target="_blank" rel="noopener noreferrer">{inner}</a>
  ) : (
    <div aria-disabled="true" className="cursor-default select-none">{inner}</div>
  )
}

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
      <path d="M17.05 12.04c-.03-2.6 2.13-3.85 2.23-3.91-1.22-1.78-3.11-2.02-3.78-2.05-1.61-.16-3.14.95-3.96.95-.82 0-2.08-.93-3.42-.9-1.76.03-3.38 1.02-4.29 2.6-1.83 3.17-.47 7.86 1.31 10.43.87 1.26 1.9 2.67 3.26 2.62 1.31-.05 1.8-.85 3.39-.85 1.58 0 2.03.85 3.42.82 1.41-.02 2.3-1.28 3.16-2.55 1-1.46 1.41-2.88 1.43-2.95-.03-.01-2.74-1.05-2.77-4.17zM14.6 4.16c.72-.87 1.21-2.08 1.08-3.29-1.04.04-2.3.69-3.05 1.56-.67.77-1.26 2-1.1 3.18 1.16.09 2.35-.59 3.07-1.45z" />
    </svg>
  )
}

function PlayMark() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M3.6 1.8 13.5 12 3.6 22.2c-.36-.21-.6-.6-.6-1.08V2.88c0-.48.24-.87.6-1.08z" fill="#34d399" />
      <path d="m16.5 9-3-3L3.9 1.62 14.7 9z" fill="#60a5fa" />
      <path d="m16.5 15-12.6 7.38L13.5 12z" fill="#f87171" />
      <path d="m20.4 10.5c.72.42.72 1.58 0 2L16.5 15l-3-3 3-3z" fill="#fbbf24" />
    </svg>
  )
}
