import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        panel: "#11111a",
        accent: "#14b8a6",
        success: "#10b981",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(20,184,166,.28), 0 16px 34px rgba(8,145,178,.2)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up .45s ease forwards",
      },
    },
  },
  plugins: [],
} satisfies Config;
