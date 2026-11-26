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
        // Token Minimalism & Swiss Style (ui-ux-pro-max — 05-design.md v2.0)
        background: '#F8FAFC',
        foreground: '#020617',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#020617',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#020617',
        },
        primary: {
          DEFAULT: '#0F172A',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#334155',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#E8ECF1',
          foreground: '#475569',
        },
        accent: {
          DEFAULT: '#0369A1',
          foreground: '#FFFFFF',
        },
        destructive: {
          DEFAULT: '#DC2626',
          foreground: '#FFFFFF',
        },
        border: '#E2E8F0',
        input: '#E2E8F0',
        ring: '#0F172A',

        // Semantic status tokens (kontras >= 4.5:1)
        status: {
          queueBg: '#F1F5F9',
          queueText: '#334155',
          washBg: '#E0F2FE',
          washText: '#0369A1',
          ironBg: '#FEF3C7',
          ironText: '#B45309',
          readyBg: '#EDE9FE',
          readyText: '#6D28D9',
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
