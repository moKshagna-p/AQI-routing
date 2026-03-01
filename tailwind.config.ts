import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-soft': 'var(--bg-soft)',
        'bg-elevated': 'var(--bg-elevated)',
        'bg-card': 'var(--bg-card)',
        surface: {
          1: 'var(--surface-1)',
          2: 'var(--surface-2)',
          3: 'var(--surface-3)',
          4: 'var(--surface-4)',
        },
        cyan: 'var(--cyan)',
        'cyan-soft': 'var(--cyan-soft)',
        'cyan-dim': 'var(--cyan-dim)',
        danger: 'var(--danger)',
        'danger-dim': 'var(--danger-dim)',
        warn: 'var(--warn)',
        'warn-dim': 'var(--warn-dim)',
      },
      borderColor: {
        subtle: 'var(--border-subtle)',
        default: 'var(--border-default)',
        strong: 'var(--border-strong)',
        accent: 'var(--border-accent)',
      },
      textColor: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        tertiary: 'var(--text-tertiary)',
        muted: 'var(--text-muted)',
      },
      boxShadow: {
        glow: '0 0 40px rgba(0, 255, 209, 0.15)',
        'glow-strong': '0 0 60px rgba(0, 255, 209, 0.3)',
        'glow-danger': '0 0 40px rgba(255, 59, 92, 0.15)',
        elevated: '0 32px 80px -20px rgba(0, 0, 0, 0.75), 0 12px 24px -4px rgba(0, 0, 0, 0.4)',
        panel: '0 40px 80px -20px rgba(0, 0, 0, 0.7)',
        card: '0 8px 32px -8px rgba(0, 0, 0, 0.5)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.06)',
      },
      transitionTimingFunction: {
        air: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
        expo: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '28px',
        '4xl': '44px',
      },
      fontSize: {
        'display-hero': ['clamp(4rem, 10vw, 9rem)', { lineHeight: '0.88', letterSpacing: '-0.045em' }],
        'display-xl': ['clamp(3rem, 7vw, 6.5rem)', { lineHeight: '0.9', letterSpacing: '-0.04em' }],
        'display-lg': ['clamp(2.25rem, 4.5vw, 4rem)', { lineHeight: '0.95', letterSpacing: '-0.035em' }],
        'display-md': ['clamp(1.5rem, 2.5vw, 2.25rem)', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
        'body-lg': ['1.125rem', { lineHeight: '1.7' }],
        'body': ['0.9375rem', { lineHeight: '1.65' }],
        'body-sm': ['0.8125rem', { lineHeight: '1.55' }],
        'caption': ['0.6875rem', { lineHeight: '1.4' }],
        'micro': ['0.5625rem', { lineHeight: '1.3' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
        '38': '9.5rem',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'gradient': 'gradient-shift 8s ease infinite',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
        'rotate-slow': 'rotate-slow 40s linear infinite',
        'marquee': 'marquee 40s linear infinite',
      },
    }
  },
  plugins: []
};

export default config;
