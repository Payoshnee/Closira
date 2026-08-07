import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: "#fffdf8",
          100: "#faf3e8",
          200: "#f1dfc8"
        },
        champagne: "#e8c99a",
        rose: {
          300: "#e9a9b8",
          500: "#bd6073",
          700: "#88404f"
        },
        lavender: "#c8b7e8",
        sage: "#9fb7a5",
        charcoal: "#201d1d"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(42, 32, 25, 0.11)",
        line: "0 1px 0 rgba(32, 29, 29, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
