/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2D5F3F',
        secondary: '#7FB069',
        accent: '#F4A259',
        background: '#FFFEF9',
        text: '#2C3333',
        success: '#7FB069',
        warning: '#F4A259',
        error: '#E76F51',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
