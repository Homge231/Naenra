/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // FE Palette
        hexred: '#E63946',
        orange: '#FF7B00',
        lightOrange: '#FFA62B',
        blue: '#3B82F6',
        lightBlue: '#60A5FA',
        darkNavy: '#0F172A',
        white: '#F8FAFC',
        success: '#22C55E',
        
        // BE Colors mapped to FE Palette
        'primary-fixed': '#FF7B00',        // orange
        'background': '#10131a',
        'surface-container': '#1d2026',
        'surface-container-high': '#272a31',
        'surface-container-highest': '#32353c',
        'on-surface': '#e1e2eb',
        'on-surface-variant': '#b9cacb',
        'secondary': '#FFA62B',            // lightOrange
        'tertiary-fixed': '#22C55E',       // success
        'outline-variant': '#3b494b',
        'error': '#E63946',                // hexred
        'on-primary': '#0F172A',           // darkNavy
      }
    },
  },
  plugins: [],
}