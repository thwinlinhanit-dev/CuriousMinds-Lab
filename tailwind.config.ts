import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Nunito", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        physics: { 50: "#eff6ff", 100: "#dbeafe", 200: "#bfdbfe", 500: "#3b82f6", 600: "#2563eb", 700: "#1d4ed8" },
        chemistry: { 50: "#fdf4ff", 100: "#fae8ff", 200: "#f5d0fe", 500: "#a855f7", 600: "#9333ea", 700: "#7e22ce" },
        biology: { 50: "#f0fdf4", 100: "#dcfce7", 200: "#bbf7d0", 500: "#22c55e", 600: "#16a34a", 700: "#15803d" },
        earthspace: { 50: "#fff7ed", 100: "#ffedd5", 200: "#fed7aa", 500: "#f97316", 600: "#ea580c", 700: "#c2410c" },
        math: { 50: "#fefce8", 100: "#fef9c3", 200: "#fef08a", 500: "#eab308", 600: "#ca8a04", 700: "#a16207" },
        music: { 50: "#fdf2f8", 100: "#fce7f3", 200: "#fbcfe8", 500: "#ec4899", 600: "#db2777", 700: "#be185d" },
        art: { 50: "#fff1f2", 100: "#ffe4e6", 200: "#fecdd3", 500: "#f43f5e", 600: "#e11d48", 700: "#be123c" },
        cs: { 50: "#f0fdfa", 100: "#ccfbf1", 200: "#99f6e4", 500: "#14b8a6", 600: "#0d9488", 700: "#0f766e" },
        language: { 50: "#f5f3ff", 100: "#ede9fe", 200: "#ddd6fe", 500: "#8b5cf6", 600: "#7c3aed", 700: "#6d28d9" },
        xp: { gold: "#fbbf24", bronze: "#d97706", silver: "#9ca3af", platinum: "#06b6d4" },
      },
      animation: {
        "bounce-slow": "bounce 2s infinite",
        "pulse-glow": "pulse-glow 2s infinite",
        "slide-up": "slideUp 0.3s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
        "celebrate": "celebrate 0.6s ease-out",
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 5px rgba(59,130,246,0.5)" },
          "50%": { boxShadow: "0 0 20px rgba(59,130,246,0.8)" },
        },
        slideUp: { "0%": { transform: "translateY(10px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        celebrate: { "0%": { transform: "scale(1)" }, "50%": { transform: "scale(1.2)" }, "100%": { transform: "scale(1)" } },
        float: { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
