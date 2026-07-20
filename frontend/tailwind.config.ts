import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        background: "oklch(0.19 0.02 250)",
        foreground: "oklch(0.96 0.005 250)",
        card: "oklch(0.23 0.025 250)",
        panel: "oklch(0.26 0.028 250)",
        primary: {
          DEFAULT: "oklch(0.78 0.15 75)",
          foreground: "oklch(0.2 0.02 250)",
        },
        secondary: {
          DEFAULT: "oklch(0.3 0.03 250)",
          foreground: "oklch(0.96 0.005 250)",
        },
        muted: {
          DEFAULT: "oklch(0.28 0.025 250)",
          foreground: "oklch(0.68 0.02 250)",
        },
        accent: {
          DEFAULT: "oklch(0.72 0.13 195)",
          foreground: "oklch(0.18 0.02 250)",
        },
        destructive: {
          DEFAULT: "oklch(0.62 0.22 25)",
          foreground: "oklch(0.98 0 0)",
        },
        success: {
          DEFAULT: "oklch(0.7 0.14 155)",
          foreground: "oklch(0.15 0.02 250)",
        },
        border: "oklch(0.32 0.025 250)",
        input: "oklch(0.3 0.025 250)",
        ring: "oklch(0.78 0.15 75)",
      },
    },
  },
  plugins: [],
};

export default config;
