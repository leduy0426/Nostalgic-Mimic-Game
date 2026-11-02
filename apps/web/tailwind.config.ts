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
        paper: {
          DEFAULT: "#FAF7F2",
          light: "#FFFFFF",
          panel: "#F0EBE1",
          border: "#D8D0C5",
        },
        ink: {
          DEFAULT: "#18181B",
          muted: "#71717A",
          faint: "#A1A1AA",
        },
        retro: {
          blue: "#2A5C9A",
          red: "#B8232C",
          amber: "#F59E0B",
          green: "#1F4E38",
          purple: "#7C3AED",
        },
      },
      boxShadow: {
        retro: "4px 4px 0px 0px rgba(24, 24, 27, 1)",
        "retro-sm": "2px 2px 0px 0px rgba(24, 24, 27, 1)",
        "retro-lg": "6px 6px 0px 0px rgba(24, 24, 27, 1)",
      },
      gridTemplateColumns: {
        '15': 'repeat(15, minmax(0, 1fr))',
      },
      gridTemplateRows: {
        '15': 'repeat(15, minmax(0, 1fr))',
      },
    },
  },
  plugins: [],
};

export default config;
