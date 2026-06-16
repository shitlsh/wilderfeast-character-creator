/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#FAF8F5',
          100: '#F4F1EA',
          200: '#EBDCB9',
          300: '#DFCA95',
          400: '#D2B470',
          500: '#C29B4C',
        },
        forest: {
          50: '#F1F7F4',
          100: '#DEEEE5',
          200: '#BDDEC9',
          300: '#8ECAAA',
          400: '#58AF81',
          500: '#3D9366',
          600: '#2E7550',
          700: '#265D42',
          850: '#1B3C2B',
          900: '#142B1F',
          950: '#0C1C14',
        },
        earth: {
          50: '#FDF8F5',
          100: '#F9ECE5',
          200: '#F1D5C6',
          300: '#E5B49C',
          400: '#D58D6E',
          500: '#C56B4E',
          600: '#B5523A',
          700: '#94412F',
          800: '#753426',
          900: '#4D1D16',
          950: '#2D100C',
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
      },
      boxShadow: {
        'rough': '2px 2px 0px 0px rgba(0,0,0,0.85)',
        'rough-md': '4px 4px 0px 0px rgba(0,0,0,0.85)',
        'rough-lg': '8px 8px 0px 0px rgba(0,0,0,0.85)',
      },
      borderWidth: {
        '3': '3px',
      }
    },
  },
  plugins: [],
}