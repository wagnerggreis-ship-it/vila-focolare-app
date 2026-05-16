import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['var(--font-jakarta)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
      colors: {
        // Azul Focolari
        primary: {
          950: '#0f2a40',
          900: '#1a3d5c',
          800: '#2B5F8A',
          700: '#3a75a8',
          600: '#4A8BBF',
          500: '#5fa3d4',
          400: '#7bbce0',
          300: '#9FC5E0',
          200: '#c4ddf0',
          100: '#E8F3FA',
          50:  '#f4f9fd',
        },
        // Âmbar da Lareira
        accent: {
          900: '#7a3a0a',
          800: '#a04f12',
          700: '#A0541A',
          600: '#b8611e',
          500: '#C96B1E',
          400: '#d9843c',
          300: '#e8a868',
          200: '#f2c99a',
          100: '#F5E8D5',
          50:  '#fdf6ee',
        },
        // Semáforo de risco
        risk: {
          verde:    '#16A34A',
          amarelo:  '#CA8A04',
          laranja:  '#EA580C',
          vermelho: '#DC2626',
        },
        // Backgrounds e neutros
        warm: {
          white: '#F9F7F4',
          50:    '#f9f7f4',
          100:   '#f0ece6',
          200:   '#e0d9cf',
        },
        border: '#CBD5E1',
        input:  '#CBD5E1',
        ring:   '#2B5F8A',
        background: '#F9F7F4',
        foreground:  '#2D3748',
        muted: {
          DEFAULT:    '#64748B',
          foreground: '#64748B',
        },
        card: {
          DEFAULT:    '#FFFFFF',
          foreground: '#2D3748',
        },
        destructive: {
          DEFAULT:    '#B91C1C',
          foreground: '#FFFFFF',
        },
        success: {
          DEFAULT:    '#2E7D52',
          foreground: '#FFFFFF',
        },
        warning: {
          DEFAULT:    '#D97706',
          foreground: '#FFFFFF',
        },
      },
      borderRadius: {
        lg: '12px',
        md: '8px',
        sm: '6px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.08)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.12)',
        sidebar: '2px 0 8px rgba(0,0,0,0.10)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'slide-in': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'slide-in': 'slide-in 0.2s ease-out',
        'fade-in': 'fade-in 0.15s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
