# StayEasy

StayEasy is a **frontend-only MVP** app that helps users discover, compare, and manage **hotel membership benefits by city**.

> This is an MVP. There is **no backend, database, login, or payment** yet. All user data (saved memberships, vouchers, language, city) is kept in the browser via `localStorage`, and membership data is sample/mock data for illustration.

## Tech stack

- **React** (with React Router)
- **Vite**
- **Tailwind CSS**
- **localStorage** for persistence

## Features

- Rich imagery — hotel hero photos and per-category benefit photos (dining/room/spa/…) via a hybrid `SmartImage` that falls back to a themed gradient + icon if a photo is missing or fails to load
- City-based hotel membership discovery (Ho Chi Minh, Da Nang, Hanoi, Seoul, Bangkok, Tokyo)
- Membership comparison (side-by-side, up to 3)
- Membership detail pages with benefits, hotels, notes, a value/ROI summary, and the included voucher pack — tap any voucher for its full description, eligible hotels, on-site conditions, and terms
- **Purchase flow** — paid memberships are bought through StayEasy while payment is settled at the hotel brand (invoice); orders move requested → invoiced → paid → activated, and activation issues the voucher pack to the wallet
- **Commission BM** — each paid membership has a commission rate; an internal (demo) settlement view totals GMV and StayEasy commission
- **Partner dashboard** — `/partner` aggregates orders into KPIs, GMV/commission by currency, order-status distribution, and per-membership breakdown
- **Voucher gifting** — transferable vouchers can be gifted to a recipient (reduces availability)
- **Per-account data** — wallet/orders/reservations are namespaced per signed-in user; guests keep separate data
- **Voucher wallet** — owned memberships become category-grouped e-vouchers with available / used counts
- **Booking requests** — request a reservation per voucher (date / guests / hotel) via WhatsApp or Email; completing one consumes a voucher
- Voucher expiry tracking (days remaining, expiring-soon highlights) and home alerts
- Recommendation quiz (5 questions → top 3 personalized matches)
- Assistance requests via **WhatsApp** or **Email** (prefilled message)
- **Easy sign-in** — one-tap "Continue with Google" (hybrid: a frontend-only demo by default; real Google Identity Services when `VITE_GOOGLE_CLIENT_ID` is set). Guests can browse/compare; saving, purchasing, and booking prompt sign-in and then resume.
- **5-language support:** Korean, English, Vietnamese, Simplified Chinese, Japanese
  (한국어 / English / Tiếng Việt / 中文 / 日本語), with English fallback

## Project structure

```
StayEasy/
├── index.html
├── package.json
├── vite.config.js · tailwind.config.js · postcss.config.js
└── src/
    ├── main.jsx · App.jsx · index.css
    ├── context/AppContext.jsx        # language, city, saved, benefits, compare, toast
    ├── i18n/
    │   ├── translations.js           # 5-language dictionary + translate()
    │   ├── useTranslation.js         # t(key) hook bound to the active language
    │   └── index.js                  # compatibility re-exports
    ├── data/                         # centralized mock data
    │   ├── memberships.js · cities.js · quiz.js
    ├── utils/
    │   ├── storage.js                # localStorage helpers (memberships, benefits, prefs)
    │   └── format.js                 # money / date / days-until
    ├── components/
    │   ├── AppHeader · BottomNavigation · Layout · Toast
    │   ├── LanguageSelector · CitySelector
    │   ├── MembershipCard · BenefitCard
    │   ├── CTAButton · EmptyState · ScoreBadge · StatusBadge
    │   ├── Icon · ui (Chip, BrandAvatar, ScoreBar, Modal, SectionTitle) · brandTheme
    └── pages/
        ├── Home · Explore · MembershipDetail
        ├── Compare · MyBenefits · Quiz · RequestAssistance
```

## Installation

Requires Node.js 18+.

```bash
npm install
```

## Run locally

```bash
npm run dev
```

Open the URL Vite prints (default http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Testing

```bash
npm run test     # Vitest unit tests (pricing/commission, i18n, formatting, voucher inventory)
npm run e2e      # Playwright E2E (purchase→activation→commission, free-join→booking)
```

Unit tests run automatically in CI before each deploy. The first E2E run needs
browsers: `npx playwright install chromium`.

### Real Google sign-in (optional)

By default sign-in is a frontend-only demo. To enable real Google sign-in,
create an OAuth Client ID in Google Cloud (add your origin, e.g. the GitHub
Pages URL, to Authorized JavaScript origins) and provide it at build time:

```bash
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com npm run build
```

The app then renders the official Google button and decodes the returned ID
token client-side. For production, the token should also be verified by a
backend.

## Deploy

The build output in `dist/` is a static site and can be deployed to **Vercel**, **Netlify**, or **GitHub Pages**.

- **Vercel / Netlify:** import the repo; build command `npm run build`, output directory `dist`.
- **GitHub Pages:** publish the `dist/` folder. If hosting under a sub-path, set Vite's `base` option in `vite.config.js`.

## Backend & collaboration (monorepo: Claude × Codex)

Frontend (Claude) and backend (Codex) are built in parallel in this repo:

- **API contract (source of truth):** [`docs/BACKEND_API_SPEC.md`](docs/BACKEND_API_SPEC.md)
- **Collaboration guide:** [`AGENTS.md`](AGENTS.md) · [`docs/COLLABORATION_PLAN.md`](docs/COLLABORATION_PLAN.md) · [`docs/DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md)
- **Backend:** `backend/server.js` — run with `npm run backend` (http://localhost:8787, `/api/v1`)
- **Frontend client:** `src/api/` mirrors the contract. The app runs on
  `localStorage` until `VITE_API_BASE_URL` is set; then `AppContext`/`AuthContext`
  route through the API (auth, wallet, reservations, orders, transfers). See
  [`.env.example`](.env.example) and [`docs/INTEGRATION_STATUS.md`](docs/INTEGRATION_STATUS.md).

```bash
npm run backend                                  # http://localhost:8787
VITE_API_BASE_URL=http://localhost:8787 npm run dev   # frontend in API mode
```

## Adding a backend later

The app is structured so a backend can be added without rewriting the UI:

- **Data** — `src/data/*` exports plain objects; replace with fetches that return the same shape.
- **Persistence** — `src/utils/storage.js` is the only place that touches `localStorage`; swap these functions for API calls.
- **State** — `src/context/AppContext.jsx` is the single source of truth consumed by all pages.
- **i18n** — `src/i18n/translations.js` is the central dictionary.
- **Assistance** — `src/pages/RequestAssistance.jsx` holds the placeholder WhatsApp number and support email.

## Customizing

- **Accent color:** `tailwind.config.js` → `theme.extend.colors.brand`
- **Memberships / cities / quiz:** edit files in `src/data/`
- **Translations:** edit `src/i18n/translations.js`
