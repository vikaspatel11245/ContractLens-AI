/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        risk: {
          low:      { DEFAULT: '#C0DD97', bg: '#1A2410', border: '#3D5A1E', text: '#C0DD97' },
          medium:   { DEFAULT: '#FAC775', bg: '#251A08', border: '#6B4A0F', text: '#FAC775' },
          high:     { DEFAULT: '#F09595', bg: '#2A1010', border: '#7A2020', text: '#F09595' },
          critical: { DEFAULT: '#F7C1C1', bg: '#2A0D0D', border: '#8B1A1A', text: '#F7C1C1' },
        },
        surface: {
          base:    '#0C0E12',
          raised:  '#111318',
          overlay: '#181B22',
          border:  '#1F2330',
          muted:   '#2A2F3D',
        },
        ink: {
          primary:   '#E8EAF0',
          secondary: '#8B91A8',
          muted:     '#4A5068',
          inverse:   '#0C0E12',
        },
        accent: {
          DEFAULT: '#5B8AF0',
          hover:   '#7AA3FF',
          dim:     '#1A2540',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      height: {
        header: '56px',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-risk': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up':    'fade-up 0.4s ease-out both',
        'pulse-risk': 'pulse-risk 1.5s ease-in-out infinite',
        shimmer:      'shimmer 1.8s linear infinite',
      },
    },
  },
  plugins: [],
};