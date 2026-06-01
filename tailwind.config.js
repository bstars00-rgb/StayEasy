/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefcfb',
          100: '#d4f6f4',
          200: '#aeebe9',
          300: '#79dad9',
          400: '#3fc1c2',
          500: '#1ea4a8',
          600: '#13838a',
          700: '#136970',
          800: '#15555b',
          900: '#16474d',
        },
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
