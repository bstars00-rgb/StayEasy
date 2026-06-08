import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Two web entries, one GitHub Pages deploy:
//   - index.html        → the consumer app (mobile-first)
//   - admin/index.html  → the OhmySelect Admin website (separate, desktop)
// In production (GitHub Pages) both are served under /StayEasy/.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/StayEasy/' : '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        admin: 'admin/index.html',
      },
    },
  },
}))
