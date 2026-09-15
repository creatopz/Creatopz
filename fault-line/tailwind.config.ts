import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F1EFE8",
        ink: "#111111",
        grey: "#A6A6A0",
        crack: "#FF3B30",
        electric: "#2457FF",
        acid: "#EFFF3A",
      },
      fontFamily: {
        grotesk: ["var(--font-grotesk)", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["var(--font-pixel-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        mega: ["clamp(3.5rem, 14vw, 13rem)", { lineHeight: "0.86", letterSpacing: "-0.02em" }],
        huge: ["clamp(2.5rem, 8vw, 6rem)", { lineHeight: "0.92", letterSpacing: "-0.02em" }],
      },
      keyframes: {
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        crackgrow: {
          "0%": { transform: "scaleY(0)" },
          "100%": { transform: "scaleY(1)" },
        },
        walk: {
          "0%": { transform: "translateX(-10px)" },
          "100%": { transform: "translateX(10px)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-1px) rotate(-0.3deg)" },
          "75%": { transform: "translateX(1px) rotate(0.3deg)" },
        },
      },
      animation: {
        blink: "blink 1s step-end infinite",
        crackgrow: "crackgrow 0.6s ease-out forwards",
        walk: "walk 2s ease-in-out infinite alternate",
        shake: "shake 0.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
