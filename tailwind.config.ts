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
        // Swiss Neutral + Neat Azure System (90-95% Neutral, 1 Accent)
        background: '#F8FAFA',
        foreground: '#0B1723',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#0B1723',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#0B1723',
        },
        primary: {
          DEFAULT: '#006EB3',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#F1F5F6',
          foreground: '#0B1723',
        },
        muted: {
          DEFAULT: '#F1F5F6',
          foreground: '#526474',
        },
        accent: {
          DEFAULT: '#EEF6FB',
          foreground: '#006EB3',
        },
        destructive: {
          DEFAULT: '#DC2626',
          foreground: '#FFFFFF',
        },
        border: '#E1E8EB',
        input: '#E1E8EB',
        ring: '#0B253B',

        // Neat Shader Reference Tokens (khusus NeatBackground WebGL)
        neat: {
          azure: '#00A2FF',
          aqua: '#D5ECEB',
          linen: '#EFE2CE',
          silver: '#E4E4E4',
          mint: '#F6FFFF',
        },

        // Semantic status tokens (terbatas di StatusBadge & Alert)
        status: {
          queueBg: '#F1F5F6',
          queueText: '#334155',
          washBg: '#EEF6FB',
          washText: '#005A94',
          ironBg: '#FEF7EA',
          ironText: '#92400E',
          readyBg: '#ECFEFF',
          readyText: '#0E7490',
          doneBg: '#ECFDF5',
          doneText: '#166534',
          unpaidBg: '#FEF2F2',
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
