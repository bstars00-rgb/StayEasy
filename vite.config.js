import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Three web entries, one GitHub Pages deploy:
//   - index.html        → the consumer app (mobile-first)
//   - admin/index.html  → the OhmySelect Admin website (separate, desktop)
//   - site/index.html   → the company marketing website
// Served under the repo sub-path on Pages. Override via VITE_BASE when the
// repo is renamed (e.g. VITE_BASE=/OhmySelect/) — no code change needed.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? process.env.VITE_BASE || '/StayEasy/' : '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        admin: 'admin/index.html',
        site: 'site/index.html',
      },
    },
  },
}))
