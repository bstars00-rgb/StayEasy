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
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Noto Sans',
          'Apple SD Gothic Neo',
          'Malgun Gothic',
          'Hiragino Sans',
          'Microsoft YaHei',
          'sans-serif',
        ],
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
