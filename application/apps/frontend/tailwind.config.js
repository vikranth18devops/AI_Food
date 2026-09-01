/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        heading: ['"Outfit"', 'sans-serif'],
        jura: ['"Jura"', 'sans-serif'],
        tech: ['"Jura"', 'sans-serif'],
      },
      colors: {
        dark: {
          950: '#060911',
          900: '#0b111e',
          850: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        },
        brand: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        accent: {
          teal: '#14b8a6',
          sky: '#0284c7',
          violet: '#8b5cf6',
          amber: '#f59e0b',
          rose: '#f43f5e',
        },
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(16, 185, 129, 0.3)',
        'glow-teal': '0 0 40px -10px rgba(20, 184, 166, 0.35)',
        'glow-sky': '0 0 40px -10px rgba(2, 132, 199, 0.35)',
        'glow-violet': '0 0 40px -10px rgba(139, 92, 246, 0.35)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
