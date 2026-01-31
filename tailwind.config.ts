import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        iron: {
            DEFAULT: "#000000",
            50: "#1a1a1a",
            100: "#333333",
            200: "#4d4d4d",
            300: "#666666",
            800: "#121212",
            900: "#0a0a0a"
        },
        accent: {
            DEFAULT: "#D4AF37", // Gold-ish for premium feel, or could use Red
            red: "#E53E3E"
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
