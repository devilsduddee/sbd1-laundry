import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Token Qwash Hygienic (05-design.md)
        background: '#F5F6FA',
        foreground: '#1A1A2E',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#1A1A2E',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#1A1A2E',
        },
        primary: {
          DEFAULT: '#4F46E5',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#EEF0F8',
          foreground: '#1A1A2E',
        },
        muted: {
          DEFAULT: '#EEF0F8',
          foreground: '#6B7280',
        },
        accent: {
          DEFAULT: '#EEF0F8',
          foreground: '#1E1B4B',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
        },
        border: '#E4E7F2',
        input: '#E4E7F2',
        ring: '#4F46E5',

        // Semantic brand & status tokens
        brand: {
          midnight: '#1E1B4B',
          indigo: '#4F46E5',
        },
        status: {
          queueBg: '#F3F4F6',
          queueText: '#374151',
          washBg: '#DBEAFE',
          washText: '#1D4ED8',
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
        lg: '1rem',       // 16px — Card utama
        md: '0.75rem',    // 12px — Input & Button
        sm: '0.5rem',     // 8px
      },
    },
  },
  plugins: [],
};

export default config;
