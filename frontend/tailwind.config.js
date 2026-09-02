/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
<<<<<<< HEAD
=======
        // Rickshaw livery + ticket-paper palette
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
        ink: {
          DEFAULT: '#16171A',
          800: '#222329',
          700: '#2E2F37',
          600: '#43454F',
          400: '#71727C',
        },
        marigold: {
          50: '#FFF8E5',
          100: '#FFEEBF',
          200: '#FFE08C',
          300: '#FFCF54',
          400: '#FFC22E',
<<<<<<< HEAD
          500: '#F5AE0E',
=======
          500: '#F5AE0E', // core brand yellow — the rickshaw roof
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
          600: '#D6910A',
          700: '#A66F08',
        },
        paper: {
<<<<<<< HEAD
          DEFAULT: '#FBF6EA',
=======
          DEFAULT: '#FBF6EA', // ticket paper
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
          dim: '#F1E9D6',
        },
        route: {
          50: '#E9F7F3',
          100: '#CBEEE4',
          400: '#2FA88C',
<<<<<<< HEAD
          500: '#1B8F7A',
=======
          500: '#1B8F7A', // teal — live-tracking / route lines
>>>>>>> 4ba24fce8e86fc4305bf3ccaac00450d3f7638f9
          600: '#146B5D',
        },
        alert: {
          50: '#FDECEA',
          400: '#E1483B',
          500: '#C93A2E',
        },
        rose: {
          50: '#FDF0F3',
          100: '#FBDCE4',
          400: '#E8527A',
          500: '#D33C63',
        },
      },
      fontFamily: {
        display: ['"Archivo Black"', 'sans-serif'],
        body: ['Karla', 'sans-serif'],
        meter: ['"IBM Plex Mono"', 'monospace'],
      },
      backgroundImage: {
        'stripe-diagonal': 'repeating-linear-gradient(-45deg, rgba(255,194,46,0.14) 0, rgba(255,194,46,0.14) 2px, transparent 2px, transparent 14px)',
      },
      boxShadow: {
        ticket: '0 12px 30px -12px rgba(22,23,26,0.35)',
      },
      keyframes: {
        drive: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(calc(100% - 1.75rem))' },
        },
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        drive: 'drive 2.4s cubic-bezier(.65,0,.35,1) infinite alternate',
        'fade-in': 'fadeIn 0.35s ease-out',
      },
    },
  },
  plugins: [],
};
