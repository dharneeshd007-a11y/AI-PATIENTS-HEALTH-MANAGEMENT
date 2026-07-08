/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        secondary: '#0EA5E9',
        success: '#10B981',
        dark: '#0F172A',
        glass: 'rgba(255, 255, 255, 0.8)',
        glassborder: 'rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        'xl': '20px',
      }
    },
  },
  plugins: [],
}
