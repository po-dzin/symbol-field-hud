/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep dark gradient base
        'os-dark': '#0a0a0c', // Graphite/Near Black
        'os-dark-blue': '#111118', // Deep Blue/Violet hint
        
        // Crystalline Accents
        'os-cyan': '#00f0ff', // Primary Action
        'os-cyan-dim': 'rgba(0, 240, 255, 0.1)',
        'os-violet': '#bd00ff', // Meta/Mode
        'os-violet-dim': 'rgba(189, 0, 255, 0.1)',
        'os-amber': '#ffbd00', // Warning
        
        // Text
        'os-text-primary': '#F5F5F7',
        'os-text-secondary': '#9CA3AF',
        'os-text-meta': '#4B5563',
        
        // Glass
        'os-glass-border': 'rgba(255, 255, 255, 0.06)',
        'os-glass-bg': 'rgba(255, 255, 255, 0.03)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
