import type { Config } from "tailwindcss";

const { fontFamily } = require("tailwindcss/defaultTheme");

const config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./ui/**/*.{ts,tsx}",
    "./content/**/*.{md,mdx}",
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1rem",
        md: "1.5rem",
        lg: "1.5rem",
        xl: "2rem",
        "2xl": "2rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1440px",
      },
    },
    extend: {
      colors: {
        /* Design System Tokens */
        neutral: {
          1: "hsl(var(--neutral-1))",
          2: "hsl(var(--neutral-2))",
          3: "hsl(var(--neutral-3))",
          6: "hsl(var(--neutral-6))",
          9: "hsl(var(--neutral-9))",
          11: "hsl(var(--neutral-11))",
          12: "hsl(var(--neutral-12))",
        },
        bg: "hsl(var(--bg))",
        surface: "hsl(var(--surface))",
        "text-primary": "hsl(var(--text-primary))",
        "text-secondary": "hsl(var(--text-secondary))",
        brand: {
          DEFAULT: "hsl(var(--brand))",
          foreground: "hsl(var(--brand-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        /* Legacy shadcn tokens (preserved for compatibility) */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        none: "0px",
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius)",
        md: "var(--radius)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        full: "9999px",
      },
      spacing: {
        /* 8-point grid system - preserved defaults + custom values */
      },
      fontSize: {
        xs: ["12px", { lineHeight: "18px" }],
        sm: ["14px", { lineHeight: "22px" }],
        base: ["16px", { lineHeight: "25px" }],
        lg: ["18px", { lineHeight: "27px" }],
        xl: ["20px", { lineHeight: "30px" }],
        "2xl": ["24px", { lineHeight: "34px" }],
        "3xl": ["30px", { lineHeight: "40px" }],
        "4xl": ["36px", { lineHeight: "44px" }],
        "5xl": ["48px", { lineHeight: "56px" }],
      },
      boxShadow: {
        e0: "var(--shadow-e0)",
        e1: "var(--shadow-e1)",
        e2: "var(--shadow-e2)",
        e3: "var(--shadow-e3)",
      },
      transitionDuration: {
        micro: "var(--motion-micro)",
        fast: "var(--motion-fast)",
        base: "var(--motion-base)",
        slow: "var(--motion-slow)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        urban: ["var(--font-urban)", ...fontFamily.sans],
        heading: ["var(--font-heading)", ...fontFamily.sans],
        geist: ["var(--font-geist)", ...fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Fade up and down
        "fade-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "80%": {
            opacity: "0.7",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0px)",
          },
        },
        "fade-down": {
          "0%": {
            opacity: "0",
            transform: "translateY(-10px)",
          },
          "80%": {
            opacity: "0.6",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0px)",
          },
        },
        // Fade in and out
        "fade-in": {
          "0%": {
            opacity: "0",
          },
          "50%": {
            opacity: "0.6",
          },
          "100%": {
            opacity: "1",
          },
        },
        "fade-out": {
          "0%": {
            opacity: "0",
          },
          "50%": {
            opacity: "0.6",
          },
          "100%": {
            opacity: "1",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down var(--motion-fast) ease-out",
        "accordion-up": "accordion-up var(--motion-fast) ease-out",
        "fade-up": "fade-up 0.5s ease-out",
        "fade-down": "fade-down 0.5s ease-out",
        "fade-in": "fade-in var(--motion-base) ease",
        "fade-out": "fade-out var(--motion-base) ease",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;

export default config;
