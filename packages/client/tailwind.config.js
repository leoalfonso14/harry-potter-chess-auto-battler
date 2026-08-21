/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cost1: '#94a3b8', // Gray
        cost2: '#22c55e', // Green
        cost3: '#3b82f6', // Blue
        cost4: '#a855f7', // Purple
        cost5: '#eab308', // Gold
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
