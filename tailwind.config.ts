import type { Config } from 'tailwindcss';

/**
 * Verda design tokens (spec §9). Every color is a CSS custom property defined in
 * app/globals.css; components reference these semantic names — never raw hex.
 */
const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          900: 'hsl(var(--forest-900))',
          700: 'hsl(var(--forest-700))',
          500: 'hsl(var(--forest-500))',
        },
        leaf: {
          300: 'hsl(var(--leaf-300))',
          50: 'hsl(var(--leaf-50))',
        },
        sky: {
          500: 'hsl(var(--sky-500))',
        },
        amber: {
          400: 'hsl(var(--amber-400))',
        },
        ember: {
          500: 'hsl(var(--ember-500))',
        },
        slate: {
          900: 'hsl(var(--slate-900))',
          500: 'hsl(var(--slate-500))',
          200: 'hsl(var(--slate-200))',
        },
        canvas: 'hsl(var(--canvas))',
        surface: 'hsl(var(--surface))',

        // shadcn/ui semantic tokens mapped onto the Verda palette
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
      },
      borderRadius: {
        // spec §8: cards 16px, buttons 12px, pills 999px
        card: '16px',
        button: '12px',
        pill: '999px',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 16px rgba(0,0,0,0.06)',
      },
      spacing: {
        // 4px base scale (spec §8): 4 8 12 16 24 32 48 64 already covered by Tailwind defaults
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
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
