/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy colors for backwards compatibility
        primary: '#2D5F3F',
        secondary: '#7FB069',
        accent: '#F4A259',
        background: '#FFFEF9',
        text: '#2C3333',
        success: '#7FB069',
        warning: '#F4A259',
        error: '#E76F51',

        // New vibrant color scales
        forest: {
          50: '#f0f7f4',
          100: '#dceee4',
          200: '#b9ddca',
          300: '#8dc5a9',
          400: '#5ea685',
          500: '#3d8a66',
          600: '#2d6f4f',
          700: '#255940',
          800: '#1f4834',
          900: '#1a3c2b',
          950: '#0e211a',
        },
        sage: {
          50: '#f6f9f4',
          100: '#e9f2e4',
          200: '#d4e5ca',
          300: '#b2d1a4',
          400: '#8fb977',
          500: '#6f9c56',
          600: '#577d43',
          700: '#456237',
          800: '#394e2e',
          900: '#304128',
          950: '#172313',
        },
        sunset: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f4a259',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        glow: {
          purple: '#B794F4',
          pink: '#F687B3',
          blue: '#63B3ED',
          yellow: '#F6E05E',
        },
        cream: '#FFFEF9',
        charcoal: {
          50: '#f7f7f7',
          100: '#e3e3e3',
          200: '#c8c8c8',
          300: '#a4a4a4',
          400: '#818181',
          500: '#666666',
          600: '#515151',
          700: '#434343',
          800: '#383838',
          900: '#2c3333',
          950: '#1a1a1a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui'],
      },
      fontSize: {
        'xxs': '0.625rem',
      },
      fontWeight: {
        'black': '900',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundColor: {
        'glass': 'rgba(255, 255, 255, 0.1)',
        'glass-dark': 'rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'bounce-soft': 'bounce-soft 0.6s ease-in-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-in',
        'scale-in': 'scale-in 0.2s ease-out',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
}
