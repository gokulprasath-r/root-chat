import type { Config } from "tailwindcss";

const config: Config = {
  // Only scan the app source so Tailwind can tree-shake unused classes.
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Brand palette taken from the theme reference (themeref.png).
      colors: {
        root: {
          primary: "#6F4E37", // coffee brown  – headings, primary buttons
          secondary: "#8B5E3C", // lighter brown – secondary text/borders
          accent: "#6B8E23", // olive green   – leaves, highlights
          bg: "#F5F1E8", // cream         – page background
        },
      },
      // Toast slide-in/out from the top of the screen.
      keyframes: {
        "toast-in": {
          "0%": { transform: "translateY(-120%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "toast-out": {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(-120%)", opacity: "0" },
        },
      },
      animation: {
        "toast-in": "toast-in 0.3s ease-out",
        "toast-out": "toast-out 0.3s ease-in forwards",
      },
    },
  },
  plugins: [],
};

export default config;
