/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			background: 'hsl(var(--background))',
  			text: '#2C3333',
  			success: '#7FB069',
  			warning: '#F4A259',
  			error: '#E76F51',
  			forest: {
  				'50': '#f0f7f4',
  				'100': '#dceee4',
  				'200': '#b9ddca',
  				'300': '#8dc5a9',
  				'400': '#5ea685',
  				'500': '#3d8a66',
  				'600': '#2d6f4f',
  				'700': '#255940',
  				'800': '#1f4834',
  				'900': '#1a3c2b',
  				'950': '#0e211a'
  			},
  			sage: {
  				'50': '#f6f9f4',
  				'100': '#e9f2e4',
  				'200': '#d4e5ca',
  				'300': '#b2d1a4',
  				'400': '#8fb977',
  				'500': '#6f9c56',
  				'600': '#577d43',
  				'700': '#456237',
  				'800': '#394e2e',
  				'900': '#304128',
  				'950': '#172313'
  			},
  			sunset: {
  				'50': '#fff7ed',
  				'100': '#ffedd5',
  				'200': '#fed7aa',
  				'300': '#fdba74',
  				'400': '#fb923c',
  				'500': '#f4a259',
  				'600': '#ea580c',
  				'700': '#c2410c',
  				'800': '#9a3412',
  				'900': '#7c2d12',
  				'950': '#431407'
  			},
  			glow: {
  				purple: '#B794F4',
  				pink: '#F687B3',
  				blue: '#63B3ED',
  				yellow: '#F6E05E'
  			},
  			honey: {
  				DEFAULT: 'hsl(var(--honey))',
  				foreground: 'hsl(var(--honey-foreground))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			},
  			cream: '#FFFEF9',
  			charcoal: {
  				'50': '#f7f7f7',
  				'100': '#e3e3e3',
  				'200': '#c8c8c8',
  				'300': '#a4a4a4',
  				'400': '#818181',
  				'500': '#666666',
  				'600': '#515151',
  				'700': '#434343',
  				'800': '#383838',
  				'900': '#2c3333',
  				'950': '#1a1a1a'
  			},
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'system-ui',
  				'sans-serif'
  			],
  			display: [
  				'Playfair Display',
  				'Georgia',
  				'serif'
  			],
  			handwritten: [
  				'Caveat',
  				'cursive'
  			]
  		},
  		fontSize: {
  			xxs: '0.625rem'
  		},
  		fontWeight: {
  			black: '900'
  		},
  		spacing: {
  			'18': '4.5rem',
  			'88': '22rem'
  		},
  		backdropBlur: {
  			xs: '2px'
  		},
  		backgroundColor: {
  			glass: 'rgba(255, 255, 255, 0.1)',
  			'glass-dark': 'rgba(0, 0, 0, 0.1)'
  		},
  		borderRadius: {
  			'4xl': '2rem',
  			'5xl': '2.5rem',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		boxShadow: {
  			soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
  			'soft-lg': '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
  			glass: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  			'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  			warm: '0 4px 20px -5px rgba(61, 138, 102, 0.2)',
  			'warm-lg': '0 10px 40px -10px rgba(61, 138, 102, 0.3)',
  			sage: '0 4px 20px -5px rgba(111, 156, 86, 0.2)'
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'bounce-soft': 'bounce-soft 0.6s ease-in-out',
  			'slide-up': 'slide-up 0.3s ease-out',
  			'fade-in': 'fade-in 0.2s ease-in',
  			'scale-in': 'scale-in 0.2s ease-out',
  			shimmer: 'shimmer 2s infinite',
  			wiggle: 'wiggle 0.5s ease-in-out',
  			'grow-leaf': 'grow-leaf 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
  			'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
  			'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
  			'fade-slide-up': 'fade-slide-up 0.5s ease-out forwards'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' }
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' }
  			},
  			'bounce-soft': {
  				'0%, 100%': {
  					transform: 'translateY(0)'
  				},
  				'50%': {
  					transform: 'translateY(-10px)'
  				}
  			},
  			'slide-up': {
  				'0%': {
  					transform: 'translateY(10px)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'translateY(0)',
  					opacity: '1'
  				}
  			},
  			'fade-in': {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			'scale-in': {
  				'0%': {
  					transform: 'scale(0.95)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'scale(1)',
  					opacity: '1'
  				}
  			},
  			shimmer: {
  				'0%': {
  					backgroundPosition: '-1000px 0'
  				},
  				'100%': {
  					backgroundPosition: '1000px 0'
  				}
  			},
  			wiggle: {
  				'0%, 100%': { transform: 'rotate(-2deg)' },
  				'50%': { transform: 'rotate(2deg)' }
  			},
  			'grow-leaf': {
  				'0%': { transform: 'scale(0) rotate(-45deg)', opacity: '0' },
  				'50%': { transform: 'scale(1.1) rotate(0deg)', opacity: '1' },
  				'100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' }
  			},
  			'bounce-gentle': {
  				'0%, 100%': { transform: 'translateY(0)' },
  				'50%': { transform: 'translateY(-8px)' }
  			},
  			'pulse-glow': {
  				'0%, 100%': { boxShadow: '0 0 0 0 rgba(61, 138, 102, 0.4)' },
  				'50%': { boxShadow: '0 0 20px 10px rgba(61, 138, 102, 0)' }
  			},
  			'fade-slide-up': {
  				'0%': { opacity: '0', transform: 'translateY(20px)' },
  				'100%': { opacity: '1', transform: 'translateY(0)' }
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
