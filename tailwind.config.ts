import defaultTheme from "tailwindcss/defaultTheme";
import type { Config } from 'tailwindcss'

/** @type {import('tailwindcss').Config} */
export default <Partial<Config>>{
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      colors: {
        primaryc: '#2c23d4',  // Definiert die erste Farbe als "primary"
        secondaryc: '#843dba',  // Definiert die zweite Farbe als "secondary"
        blue: {
          50: '#F2F1FD',
          100: '#DEDDFB',
          200: '#BDBAF7',
          300: '#9A94F3',
          400: '#675DEB',
          500: '#2C23D4', // Hauptfarbe
          600: '#261FB5',
          700: '#1F198F',
          800: '#18136E',
          900: '#110E4F',
          950: '#0A0833'
        }
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
