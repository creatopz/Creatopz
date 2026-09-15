import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    screens: {
      xs: "380px",
      sm: "540px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        paper: "#F4F1EA",
        paper2: "#EAE6DC",
        ink: "#111111",
        red: "#FF3B30",
        blue: "#245CFF",
        acid: "#C7FF00",
      },
      fontFamily: {
        grotesk: ["var(--font-grotesk)", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        pixel: ["var(--font-pixel)", "monospace"],
      },
      fontSize: {
        mega: ["clamp(3rem, 10vw, 9rem)", { lineHeight: "0.92", letterSpacing: "-0.02em" }],
        huge: ["clamp(2.25rem, 6vw, 5rem)", { lineHeight: "0.96", letterSpacing: "-0.01em" }],
      },
      backgroundImage: {
        grid: "linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)",
      },
      keyframes: {
        blink: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0" } },
        wiggle: {
          "0%,100%": { transform: "rotate(-0.6deg)" },
          "50%": { transform: "rotate(0.6deg)" },
        },
        crack: {
          "0%": { strokeDashoffset: "1" },
          "100%": { strokeDashoffset: "0" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        glitch: {
          "0%, 100%": { transform: "translate(0,0)" },
          "20%": { transform: "translate(-1px,1px)" },
          "40%": { transform: "translate(1px,-1px)" },
          "60%": { transform: "translate(-1px,-1px)" },
          "80%": { transform: "translate(1px,1px)" },
        },
        floatUp: {
          "0%": { transform: "translateY(6px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        blink: "blink 1.4s step-start infinite",
        wiggle: "wiggle 4s ease-in-out infinite",
        marquee: "marquee 28s linear infinite",
        glitch: "glitch 0.22s steps(2)",
        floatUp: "floatUp 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
