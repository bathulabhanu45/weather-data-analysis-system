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
        forest: {
          950: '#030805',
          900: '#050D09',
          850: '#0A1710',
          800: '#0F2117',
          700: '#173626',
          600: '#23523B',
        },
        obsidian: {
          950: '#030805',
          900: '#050D09',
          850: '#0A1710',
          800: '#0F2117',
          700: '#173626',
          600: '#23523B',
        },
        leaf: {
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
        },
        brand: {
          primary: '#22C55E',
          secondary: '#10B981',
          accent: '#84CC16',
          card: 'rgba(10, 22, 16, 0.82)',
          border: 'rgba(34, 197, 94, 0.18)',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-primary': '0 0 25px -5px rgba(34, 197, 94, 0.4)',
        'glow-secondary': '0 0 25px -5px rgba(16, 185, 129, 0.4)',
        'glow-leaf': '0 0 25px -5px rgba(74, 222, 128, 0.4)',
        'glass': '0 12px 35px -8px rgba(0, 0, 0, 0.65)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'subtle-grid': 'radial-gradient(circle, rgba(34, 197, 94, 0.08) 1px, transparent 1px)',
      }
    },
  },
  plugins: [],
}
