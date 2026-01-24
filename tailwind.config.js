/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Neon theme colors
        'neon': '#00FF41',
        'neon-dim': '#00CC33',
        'neon-glow': 'rgba(0, 255, 65, 0.4)',
        'neon-subtle': 'rgba(0, 255, 65, 0.1)',
        // Base colors
        'dark': '#000000',
        'dark-soft': '#0a0a0a',
        'surface': '#0d0d0d',
        'surface-light': '#141414',
        'text': '#ffffff',
        'muted': '#6b7280',
        // Glass effect
        'glass': 'rgba(255, 255, 255, 0.03)',
        'glass-border': 'rgba(255, 255, 255, 0.08)',
        // Legacy (keep for compatibility)
        'primary': '#00FF41',
        'secondary': '#00CC33',
        'border': '#1a1a1a',
        'border-light': '#2a2a2a',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(0, 255, 65, 0.4)',
          },
        },
        'pulse-neon': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(0, 255, 65, 0.4)',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(0, 255, 65, 0.6), 0 0 60px rgba(0, 255, 65, 0.3)',
          },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
