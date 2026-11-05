/**
 * Portify AI — Design System Design Tokens
 * Restrained, enterprise-grade SaaS design tokens.
 */

export const typography = {
  fontFamily: {
    sans: 'Plus Jakarta Sans, Inter, system-ui, -apple-system, sans-serif',
    mono: 'JetBrains Mono, Menlo, monospace',
    serif: 'Newsreader, Georgia, serif',
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.01em' }],
    sm: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0' }],
    base: ['1rem', { lineHeight: '1.5rem', letterSpacing: '-0.01em' }],
    lg: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.015em' }],
    xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.02em' }],
    '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.025em' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.03em' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.035em' }],
    '5xl': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.04em' }],
  },
};

export const colors = {
  brand: {
    50: '#f0f7f6',
    100: '#dceee9',
    200: '#bce0d7',
    300: '#92ccc0',
    400: '#61b0a3',
    500: '#3b9487',
    600: '#176B67', // Official Brand Primary Deep Teal
    700: '#135653',
    800: '#124543',
    900: '#123938',
    950: '#082020',
  },
  surface: {
    base: '#F7F5EF', // Soft Ivory
    card: '#ffffff',
    raised: '#ffffff',
    overlay: '#252B2A',
  },
  border: {
    subtle: '#F0ECE3',
    default: '#E6E2D8',
    strong: '#D4CEBF',
    interactive: '#176B67',
  },
  text: {
    primary: '#252B2A', // Deep Charcoal
    secondary: '#5A6260',
    muted: '#878F8D',
    inverse: '#ffffff',
  },
  status: {
    success: '#059669',
    warning: '#d97706',
    error: '#e11d48',
    info: '#176B67',
  },
};

export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
};

export const transitions = {
  fast: '150ms cubic-bezier(0.16, 1, 0.3, 1)',
  default: '200ms cubic-bezier(0.16, 1, 0.3, 1)',
  smooth: '300ms cubic-bezier(0.16, 1, 0.3, 1)',
};

