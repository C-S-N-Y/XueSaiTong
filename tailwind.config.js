/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6',
          purple: '#8B5CF6',
        },
        dark: {
          bg: '#0B0F19',
          surface: '#111827',
          border: '#1F2937',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float-slow': 'float 12s ease-in-out infinite',
        'float-slow-reverse': 'float-reverse 15s ease-in-out infinite',
        'pulse-slow': 'pulse 8s ease-in-out infinite',
        'grid-flow': 'grid 20s linear infinite',
        'grid-flow-reverse': 'grid-reverse 25s linear infinite',
        'scan': 'scan 8s linear infinite',
        'glitch': 'glitch 0.3s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-30px) scale(1.05)' },
        },
        'float-reverse': {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(30px) scale(1.05)' },
        },
        grid: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' },
        },
        'grid-reverse': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(50%)' },
        },
        scan: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        },
        glitch: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '20%': { transform: 'translate(-2px, 1px)' },
          '40%': { transform: 'translate(2px, -1px)' },
          '60%': { transform: 'translate(-1px, 2px)' },
          '80%': { transform: 'translate(1px, -2px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}