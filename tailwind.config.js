/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          950: '#070a12',
          900: '#0c1222',
          850: '#111a33',
          800: '#172344',
          700: '#223461',
          600: '#324a87',
        },
        neon: {
          cyan: '#00F0FF',
          blue: '#38BDF8',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
          purple: '#A855F7',
          gold: '#FBBF24',
        },
        traffic: {
          clear: '#10B981',
          moderate: '#F59E0B',
          heavy: '#EF4444',
          blocked: '#DC2626',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { filter: 'drop-shadow(0 0 4px rgba(0, 240, 255, 0.4))' },
          '100%': { filter: 'drop-shadow(0 0 14px rgba(0, 240, 255, 0.8))' },
        }
      }
    },
  },
  plugins: [],
}
