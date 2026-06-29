/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        console: {
          bg: '#070D18',
          surface: '#0F1729',
          elevated: '#162033',
          border: '#243044',
          muted: '#64748B',
          text: '#E8EDF5',
          accent: '#00B4E6',
          gold: '#F4B800',
        },
        verify: {
          valid: '#22C55E',
          invalid: '#EF4444',
          warning: '#EAB308',
          manual: '#F59E0B',
          neutral: '#64748B',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(0, 180, 230, 0.15)',
        panel: '0 4px 24px rgba(0, 0, 0, 0.35)',
      },
    },
  },
  plugins: [],
};
