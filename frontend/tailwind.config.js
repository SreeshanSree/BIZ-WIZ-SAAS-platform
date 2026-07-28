/** @type {import('tailwindcss').Config} */
export default {
  // Scan all JSX/TSX files inside src/ for class usage
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['variant', '&:is(.dark *):not(.preview-isolate *), &:is(.preview-isolate .dark *)'],
  // Ensure 'background' is available as a named safe-list color
  safelist: ['bg-background', 'dark:bg-slate-900'],

  theme: {
    extend: {
      // ─── Brand Color Palette ──────────────────────────────────────────────────
      colors: {
        primary: {
          DEFAULT: '#0f172a', // Deep Slate — used for navbars, text, dark surfaces
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        secondary: {
          DEFAULT: '#3b82f6', // Vibrant Blue — CTAs, links, active states
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        accent: {
          DEFAULT: '#f59e0b', // Amber — highlights, badges, hover accents
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        background: '#f8fafc', // Off-white slate — default page background
      },

      // ─── Typography ───────────────────────────────────────────────────────────
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],      // Body text, UI elements
        display: ['Outfit', 'sans-serif'],     // Headings, hero text
        mono:    ['JetBrains Mono', 'monospace'], // Code blocks, slugs
      },

      // ─── Animations ───────────────────────────────────────────────────────────
      animation: {
        'fade-in':   'fadeIn 0.5s ease-out',
        'slide-up':  'slideUp 0.4s ease-out',
        'spin-slow': 'spin 1.5s linear infinite',
        'pulse-soft':'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },

      // ─── Shadows ─────────────────────────────────────────────────────────────
      boxShadow: {
        'card':  '0 1px 3px 0 rgb(15 23 42 / 0.08), 0 1px 2px -1px rgb(15 23 42 / 0.08)',
        'card-hover': '0 10px 25px -5px rgb(15 23 42 / 0.12), 0 4px 6px -4px rgb(15 23 42 / 0.08)',
        'blue':  '0 4px 20px 0 rgb(59 130 246 / 0.3)',
        'inner-sm': 'inset 0 1px 2px 0 rgb(15 23 42 / 0.05)',
      },

      // ─── Border Radius ────────────────────────────────────────────────────────
      borderRadius: {
        'xl':  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },

  plugins: [],
};
