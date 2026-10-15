import type { Config } from "tailwindcss";

/** Colors are driven by CSS custom properties (RGB triplets) defined in app/globals.css. */
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: token("paper"),
        surface: token("surface"),
        "surface-2": token("surface-2"),
        ink: token("ink"),
        "ink-2": token("ink-2"),
        "ink-3": token("ink-3"),
        rule: token("rule"),
        "rule-strong": token("rule-strong"),
        accent: token("accent"),
        "accent-ink": token("accent-ink"),
        danger: token("danger"),
        success: token("success"),
        warning: token("warning"),
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        label: ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.06em" }],
        display: ["clamp(2.75rem, 1.4rem + 5.6vw, 6.75rem)", { lineHeight: "0.94", letterSpacing: "-0.035em" }],
        "title-1": ["clamp(2.25rem, 1.55rem + 2.9vw, 4.25rem)", { lineHeight: "1", letterSpacing: "-0.03em" }],
        "title-2": ["clamp(1.75rem, 1.4rem + 1.5vw, 2.625rem)", { lineHeight: "1.08", letterSpacing: "-0.022em" }],
        "title-3": ["clamp(1.25rem, 1.15rem + 0.45vw, 1.5rem)", { lineHeight: "1.25", letterSpacing: "-0.012em" }],
        lead: ["clamp(1.125rem, 1.05rem + 0.4vw, 1.375rem)", { lineHeight: "1.5", letterSpacing: "-0.006em" }],
      },
      maxWidth: {
        container: "var(--container)",
        prose: "68ch",
      },
      borderRadius: {
        sm: "2px",
        DEFAULT: "4px",
        md: "6px",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      transitionDuration: {
        fast: "var(--motion-fast)",
        base: "var(--motion-base)",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
