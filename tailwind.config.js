/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { ps2: ['"Fira Sans Condensed"', '"Arial Narrow"', 'sans-serif'] },
      colors: { ps: { blue: '#5b8cff', ice: '#bfe0ff', deep: '#050a1f', violet: '#8a6bff' } },
    },
  },
  plugins: [],
};
