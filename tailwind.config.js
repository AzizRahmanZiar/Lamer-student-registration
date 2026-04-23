/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', 'ui-sans-serif', 'Inter', 'sans-serif'],
      },
      colors: {
        background: '#020617',
        foreground: '#e5e7eb',
        accent: '#38bdf8',
      },

      animation: {
        'gradient-x': 'gradient-x 3s ease infinite',
        'spin-slow': 'spin-slow 20s linear infinite',
        float: 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
