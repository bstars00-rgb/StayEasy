import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In production (GitHub Pages) the app is served from /StayEasy/.
// In dev it stays at the root so the local preview works unchanged.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/StayEasy/' : '/',
  plugins: [react()],
}))
