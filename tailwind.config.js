/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        base: '#080c14',
        surface: '#0d1117',
        card: '#161b27',
        border: '#1e2836',
        accent: '#3b82f6',
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease forwards',
        'pulse-slow': 'pulse 2s infinite',
        'shimmer': 'shimmer 1.8s infinite linear',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
    },
  },
  plugins: [],
}
