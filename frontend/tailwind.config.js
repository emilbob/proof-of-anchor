/** @type {import('tailwindcss').Config} */

// Every color is a CSS-variable channel triplet defined in src/index.css, so
// one class set serves both themes and `/alpha` modifiers still work
// (e.g. `border-accent/40`).
const token = (name) => `rgb(var(${name}) / <alpha-value>)`;

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        page: token("--c-page"),
        surface: token("--c-surface"),
        "surface-2": token("--c-surface-2"),
        line: token("--c-line"),
        ink: token("--c-ink"),
        "ink-dim": token("--c-ink-dim"),
        "ink-muted": token("--c-ink-muted"),
        accent: token("--c-accent"),
        "accent-dim": token("--c-accent-dim"),
        ok: token("--c-ok"),
        danger: token("--c-danger"),
        // Retained: referenced by the logo background in index.html meta
        "logo-dark": "#090b0c",
      },
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "SF Mono",
          "Menlo",
          "Consolas",
          "Liberation Mono",
          "DejaVu Sans Mono",
          "monospace",
        ],
      },
      borderRadius: {
        // The whole surface is square by design; kept minimal for pills
        none: "0",
      },
      letterSpacing: {
        terminal: "0.22em",
      },
      keyframes: {
        "poa-scan": {
          "0%": { transform: "translateY(-120%)" },
          "100%": { transform: "translateY(520%)" },
        },
      },
      animation: {
        "poa-scan": "poa-scan 2.6s linear infinite",
      },
    },
  },
  plugins: [],
};
