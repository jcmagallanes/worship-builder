/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        display: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        praise: '#e85d35',
        worship: '#5b8cde',
      },
      fontSize: {
        'app-sm':  ['var(--app-font-sm)',  { lineHeight: '1.5' }],
        'app-base':['var(--app-font-base)',{ lineHeight: '1.6' }],
        'app-lg':  ['var(--app-font-lg)',  { lineHeight: '1.4' }],
        'app-xl':  ['var(--app-font-xl)',  { lineHeight: '1.3' }],
      },
    },
  },
  plugins: [],
}
