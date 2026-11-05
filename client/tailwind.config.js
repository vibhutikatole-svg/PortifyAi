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
        brand: {
          50: '#f0f7f6',
          100: '#dceee9',
          200: '#bce0d7',
          300: '#92ccc0',
          400: '#61b0a3',
          500: '#3b9487',
          600: '#176B67', // Official Brand Primary Deep Teal
          700: '#135653',
          800: '#124543',
          900: '#123938',
          950: '#082020',
        },
        ivory: {
          DEFAULT: '#F7F5EF', // Official Brand Canvas Soft Ivory
          card: '#FFFFFF',
          border: '#E6E2D8',
          subtle: '#EFECE3',
          dark: '#E8E3D7',
        },
        charcoal: {
          DEFAULT: '#252B2A', // Official Brand Contrast Deep Charcoal
          muted: '#5A6260',
          subtle: '#878F8D',
          border: '#252B2A',
        },
        slate: {
          850: '#151e2e',
          925: '#0b0f19',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'monospace'],
        serif: ['Newsreader', 'Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        elevated: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}

