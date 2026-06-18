/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ocean: {
          50:  '#edfcff',
          100: '#d6f7ff',
          200: '#b5f0ff',
          300: '#83e7ff',
          400: '#48d4f8',
          500: '#20b8e8',
          600: '#0b93cc',
          700: '#0c76a6',
          800: '#106188',
          900: '#135171',
        },
        emerald: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        ink: '#0a0f1e',
      },
      boxShadow: {
        glow:   '0 0 40px rgba(11,147,204,0.25), 0 4px 20px rgba(11,147,204,0.15)',
        'glow-sm': '0 0 20px rgba(11,147,204,0.18)',
        card:   '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 24px rgba(0,0,0,0.10)',
        float:  '0 20px 60px rgba(0,0,0,0.12)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        float:        'float 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2.2s ease-in-out infinite',
        'slide-up':   'slideUp 0.3s cubic-bezier(.16,1,.3,1)',
        'fade-in':    'fadeIn 0.25s ease',
        wiggle:       'wiggle 0.5s ease-in-out',
        shimmer:      'shimmer 1.6s infinite',
      },
      keyframes: {
        float:     { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        pulseSoft: { '0%,100%': { opacity: 0.55 }, '50%': { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        wiggle:    { '0%,100%': { transform: 'rotate(0deg)' }, '25%': { transform: 'rotate(-8deg)' }, '75%': { transform: 'rotate(8deg)' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #0b93cc 0%, #10b981 100%)',
        'gradient-dark':  'linear-gradient(135deg, #0a0f1e 0%, #0f2340 100%)',
        'gradient-card':  'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))',
      },
    },
  },
  plugins: [],
}
