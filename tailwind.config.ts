import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0B0B0B",
        surface: "#151515",
        surface2: "#1C1C1C",
        gold: { DEFAULT: "#D6AD68", soft: "#E7C999" },
        ink: { DEFAULT: "#F5F5F5", dim: "#A1A1A1" },
        line: "#292929",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
