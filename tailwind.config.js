/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        ink: {
          50: '#f5f3ef',
          100: '#e8e3d8',
          200: '#d4caб6',
          300: '#b8a98a',
          400: '#9c8866',
          500: '#7d6b4c',
          600: '#5e4f38',
          700: '#3f3526',
          800: '#241e16',
          900: '#120f0b',
        },
        gold: {
          300: '#f5d98a',
          400: '#f0c84a',
          500: '#e6b020',
          600: '#c49010',
        },
        praise: '#e85d35',
        worship: '#5b8cde',
      },
    },
  },
  plugins: [],
}
