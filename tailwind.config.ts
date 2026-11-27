import type { Config } from 'tailwindcss';

const config: Config = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Fira Sans"', 'system-ui', 'sans-serif'],
        heading: ['"Fira Code"', 'monospace'],
        mono: ['"Fira Code"', 'monospace'],
      },
      colors: {
        // Unified Neat + Swiss Style Palette (05-design.md v2.2)
        background: '#F6FFFF',
        foreground: '#071422',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#071422',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#071422',
        },
        primary: {
          DEFAULT: '#0B253B',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#2D4659',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#E8F2F2',
          foreground: '#425869',
        },
        accent: {
          DEFAULT: '#006EB3',
          foreground: '#FFFFFF',
        },
        destructive: {
          DEFAULT: '#DC2626',
          foreground: '#FFFFFF',
        },
        border: '#D5E4E4',
        input: '#D5E4E4',
        ring: '#0B253B',

        // Neat Reference Accents
        neat: {
          azure: '#00A2FF',
          aqua: '#D5ECEB',
          linen: '#EFE2CE',
          silver: '#E4E4E4',
          mint: '#F6FFFF',
        },

        // Semantic status tokens (kontras >= 4.5:1)
        status: {
          queueBg: '#E8F2F2',
          queueText: '#2D4659',
          washBg: '#D5ECEB',
          washText: '#005A94',
          ironBg: '#EFE2CE',
          ironText: '#7C4D12',
          readyBg: '#E0F2FE',
          readyText: '#005A94',
          doneBg: '#DCFCE7',
          doneText: '#15803D',
          unpaidBg: '#FEE2E2',
          unpaidText: '#B91C1C',
        },
      },
      borderRadius: {
        lg: '0.75rem',   // 12px — Card utama Swiss Style
        md: '0.5rem',    // 8px — Input & Button
        sm: '0.375rem',  // 6px — Badge / Tag
      },
    },
  },
  plugins: [],
};

export default config;
