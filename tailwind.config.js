/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // "Quiet Luxury" CI — Midnight Navy scale (primary).
        brand: {
          50: '#eef2f7',
          100: '#dce4ee',
          200: '#aec0d4',
          300: '#6f8aaa',
          400: '#3a5980',
          500: '#1b3a5b',
          600: '#142c46',
          700: '#0f2238',
          800: '#0b1b2c',
          900: '#081320',
        },
        // Champagne Gold accent (point color — use sparingly).
        gold: {
          50: '#f6efe0',
          100: '#ecdfc4',
          300: '#dcc492',
          400: '#d3b67e',
          500: '#c9a96a',
          600: '#a77b4f',
          700: '#8a6440',
        },
        // Warm neutrals.
        ivory: '#f5efe6',
        beige: '#e8dfd0',
      },
      fontFamily: {
        // One humanist-sans stack; the browser picks the right font per glyph
        // so all 5 languages share the same Modern-Premium tone.
        sans: [
          'Pretendard',
          'Inter',
          'Noto Sans JP',
          'Noto Sans SC',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      // StayEasy typography scale (mobile-first). [size, {lineHeight, letterSpacing, fontWeight}]
      fontSize: {
        hero: ['1.75rem', { lineHeight: '1.25', letterSpacing: '-0.02em', fontWeight: '700' }],
        page: ['1.375rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '700' }],
        section: ['1.125rem', { lineHeight: '1.35', fontWeight: '600' }],
        card: ['1rem', { lineHeight: '1.4', fontWeight: '600' }],
        body: ['0.9375rem', { lineHeight: '1.6' }],
        caption: ['0.75rem', { lineHeight: '1.5' }],
        button: ['0.875rem', { lineHeight: '1', letterSpacing: '0.01em', fontWeight: '600' }],
        price: ['1.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'price-lg': ['1.5rem', { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '700' }],
        voucher: ['1rem', { lineHeight: '1.1', fontWeight: '700' }],
        alert: ['0.8125rem', { lineHeight: '1.4', fontWeight: '600' }],
      },
      boxShadow: {
        card: '0 2px 12px rgba(16, 60, 70, 0.06)',
        cardhover: '0 8px 28px rgba(16, 60, 70, 0.12)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}
