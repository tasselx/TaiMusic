/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1DB954',
        background: '#121212',
        surface: '#181818',
        'surface-light': '#282828',
      },
    },
  },
  plugins: [],
}
