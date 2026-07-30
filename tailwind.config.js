/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        notepad: {
          bg: '#121212',
          paper: '#1e1e1e',
          line: '#333333',
          text: '#e0e0e0',
          accent: '#0ea5e9',
          positive: '#22c55e',
          negative: '#ef4444',
        }
      }
    },
  },
  plugins: [],
}
