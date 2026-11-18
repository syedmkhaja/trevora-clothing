import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171816",
        paper: "#f4f1eb",
        olive: "#777963",
        sand: "#d8d1c5"
      },
      fontFamily: {
        sans: ["Arial", "Helvetica", "sans-serif"],
        display: ["Georgia", "serif"]
      },
      letterSpacing: { editorial: ".18em" }
    }
  },
  plugins: []
};
export default config;
