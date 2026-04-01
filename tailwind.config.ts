import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#004be2",
        "primary-dim": "#0041c7",
        "primary-container": "#809bff",
        "on-primary": "#f2f1ff",
        "on-primary-container": "#001b60",
        secondary: "#6c5a00",
        "secondary-dim": "#5e4e00",
        "secondary-container": "#ffd709",
        "on-secondary": "#fff2cd",
        "on-secondary-container": "#5b4b00",
        tertiary: "#a33800",
        "tertiary-dim": "#8f3000",
        "tertiary-container": "#ff956b",
        "on-tertiary": "#ffefeb",
        "on-tertiary-container": "#5b1b00",
        background: "#f5f7f9",
        "on-background": "#2c2f31",
        surface: "#f5f7f9",
        "surface-bright": "#f5f7f9",
        "surface-dim": "#d0d5d8",
        "surface-variant": "#d9dde0",
        "surface-container": "#e5e9eb",
        "surface-container-high": "#dfe3e6",
        "surface-container-highest": "#d9dde0",
        "surface-container-low": "#eef1f3",
        "surface-container-lowest": "#ffffff",
        "on-surface": "#2c2f31",
        "on-surface-variant": "#595c5e",
        outline: "#747779",
        "outline-variant": "#abadaf",
        error: "#b41340",
        "error-container": "#f74b6d",
        "on-error": "#ffefef",
        "on-error-container": "#510017",
      },
      fontFamily: {
        headline: ["Lexend", "sans-serif"],
        body: ['"Plus Jakarta Sans"', "sans-serif"],
      },
      fontSize: {
        // Display scale (Lexend) — court numbers, queue positions
        "display-lg": ["3.5rem", { lineHeight: "1", letterSpacing: "-0.02em", fontWeight: "900" }],
        "display-md": ["2.75rem", { lineHeight: "1", letterSpacing: "-0.02em", fontWeight: "900" }],
        "display-sm": ["2.25rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "800" }],
        // Headline scale (Lexend)
        "headline-lg": ["2rem", { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-md": ["1.75rem", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-sm": ["1.5rem", { lineHeight: "1.25", letterSpacing: "-0.02em", fontWeight: "700" }],
        // Body (Plus Jakarta Sans)
        "body-lg": ["1rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],
        // Label (Plus Jakarta Sans — all-caps, tracked)
        "label-md": ["0.75rem", { lineHeight: "1", letterSpacing: "0.05em", fontWeight: "500" }],
        "label-sm": ["0.625rem", { lineHeight: "1", letterSpacing: "0.05em", fontWeight: "500" }],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1.5rem",
        "2xl": "2rem",
        full: "9999px",
      },
      boxShadow: {
        kinetic: "0px 12px 32px rgba(44, 47, 49, 0.06)",
        float: "0px 20px 48px rgba(44, 47, 49, 0.10)",
      },
      letterSpacing: {
        tight: "-0.02em",
        editorial: "0.05em",
      },
      spacing: {
        18: "4.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
