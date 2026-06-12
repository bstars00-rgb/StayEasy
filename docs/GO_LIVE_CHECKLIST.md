# OhmySelect — Go-live checklist

What's left to flip the product fully "live". Most of these are external
account/console settings (not code). Each is one-time.

## 1) Real Google sign-in  (owner — Google Cloud + GitHub)
Code is ready (hybrid GIS via `VITE_GOOGLE_CLIENT_ID`); unset = demo sign-in.
1. Google Cloud Console → APIs & Services → Credentials → **Create OAuth client ID** (Web).
2. **Authorized JavaScript origins**: add `https://bstars00-rgb.github.io`
   (and `http://localhost:5173` for local testing).
3. GitHub repo → Settings → Secrets and variables → **Actions → Variables** →
   new variable **`VITE_GOOGLE_CLIENT_ID`** = `<your-id>.apps.googleusercontent.com`.
4. Re-run the **Deploy** workflow (push or "Run workflow"). Done — the real
   Google button replaces the demo one.

## 2) Back-office operator role  (Codex — Render)
Admin works (ADMIN_EMAILS). To enable the read-only **operator** role:
- Render → backend service → Environment → add **`OPERATOR_EMAILS`** =
  comma-separated operator emails. (admin = full; operator = read + handle
  reservations/CS, no catalog/finance writes.)

## 3) Repo rename → OhmySelect  (owner — optional, when ready)
URLs are currently under `/StayEasy/`. The base path is already overridable.
1. GitHub → repo Settings → **Rename** to `OhmySelect`.
2. GitHub repo → Actions → Variables → set **`VITE_BASE`** = `/OhmySelect/`.
3. Re-run Deploy. New URLs:
   - app `https://bstars00-rgb.github.io/OhmySelect/`
   - admin `…/OhmySelect/admin/` · site `…/OhmySelect/site/`
4. Update any hard-coded links (README badges, partner emails) if needed.
   (Backend `/StayEasy/` references and localStorage keys are unaffected.)

## 4) App store presence  (owner — later)
Marketing site "Download app" shows "Coming soon" until store URLs are set.
- Interim: the app is an installable **PWA** (Add to Home Screen) — already live.
- When published, fill `IOS_URL` / `ANDROID_URL` in `src/site/SiteApp.jsx`.
- For Android, a TWA wrapper can list the PWA on Google Play; iOS needs a
  thin native wrapper (e.g. Capacitor) or a web-clip.

## Already done (code side, no action needed)
- PWA: manifest + PNG icons (192/512/180) + service worker + install banner.
- 5-language UI (i18n parity test guards completeness), dark mode.
- Location-based recommendation, Explore search, Quiz result sharing.
- Admin website + back-office backend (verified); CORS preflight fixed.
- CI: unit + offline E2E + API E2E (incl. back-office guards) on every push.
