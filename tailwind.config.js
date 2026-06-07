/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ocean: {
          50: '#eefaff',
          100: '#d9f3ff',
          200: '#bcecff',
          300: '#8ee1ff',
          400: '#58ccf8',
          500: '#32addf',
          600: '#178bbd',
          700: '#146f99',
          800: '#165d7e',
          900: '#184e69',
        },
        ink: '#0f172a',
      },
      boxShadow: {
        glow: '0 20px 70px rgba(50, 173, 223, 0.22)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2.2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: 0.55 },
          '50%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
}
