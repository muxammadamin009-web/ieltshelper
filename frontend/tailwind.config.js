/** @type {import('tailwindcss').Config} */
// Colors are wired to CSS variables (see src/index.css) so a single
// `.dark` class on <html> re-themes every `text-ink`, `bg-panel`,
// `border-line`, etc. across the whole app without per-page overrides.
const withOpacity = (varName) => `rgb(var(${varName}) / <alpha-value>)`;

module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: withOpacity('--color-ink'),
        paper: withOpacity('--color-paper'),
        panel: withOpacity('--color-panel'),
        line: withOpacity('--color-line'),
        teal: {
          DEFAULT: withOpacity('--color-teal'),
          dark: withOpacity('--color-teal-dark'),
          light: withOpacity('--color-teal-light'),
        },
        gold: {
          DEFAULT: withOpacity('--color-gold'),
          light: withOpacity('--color-gold-light'),
        },
        brick: {
          DEFAULT: withOpacity('--color-brick'),
          light: withOpacity('--color-brick-light'),
        },
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        toastIn: {
          '0%': { opacity: '0', transform: 'translateY(12px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-18px) translateX(10px)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(14px) translateX(-14px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        underlineGrow: {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out both',
        'fade-up': 'fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) both',
        'scale-in': 'scaleIn 0.22s cubic-bezier(0.16,1,0.3,1) both',
        'toast-in': 'toastIn 0.35s cubic-bezier(0.16,1,0.3,1) both',
        float: 'float 9s ease-in-out infinite',
        'float-slow': 'floatSlow 13s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 1.8s ease-in-out infinite',
        shimmer: 'shimmer 2.4s linear infinite',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.16,1,0.3,1)',
      },
    },
  },
  plugins: [],
};
