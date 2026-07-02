import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        paper: "var(--paper)",
        mist: "var(--mist)",
        line: "var(--line)",
        fog: "var(--fog)",
        white: "var(--bg-white)",
        black: "var(--text-black)",
      },
      boxShadow: {
        card: "0 12px 40px -18px rgba(0, 0, 0, 0.18)",
        panel: "0 24px 60px -24px rgba(0, 0, 0, 0.18)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      fontFamily: {
        sans: ["Avenir Next", "Segoe UI", "sans-serif"],
        mono: ["IBM Plex Mono", "SFMono-Regular", "monospace"],
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
