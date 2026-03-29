/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#3b3f8c', light: '#eef2ff', dark: '#2d3070' },
        gitlab: '#fc6d26',
      },
      fontFamily: {
        sans: ['"Apple SD Gothic Neo"', '"Noto Sans KR"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
