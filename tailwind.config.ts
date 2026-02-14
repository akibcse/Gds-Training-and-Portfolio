import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        aviation: {
          50: "#eef5ff",
          100: "#dae8ff",
          200: "#bcd5ff",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1e40af",
          900: "#102a5f"
        },
        cyan: {
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2"
        },
        cta: {
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706"
        },
        ink: "#102a43"
      },
      boxShadow: {
        soft: "0 20px 45px -25px rgba(16, 42, 67, 0.32)",
        glow: "0 0 0 0 rgba(34, 211, 238, 0.45)",
        glowHover: "0 0 24px 2px rgba(34, 211, 238, 0.45)"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(245, 158, 11, 0.35)" },
          "50%": { boxShadow: "0 0 0 10px rgba(245, 158, 11, 0)" }
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" }
        }
      },
      animation: {
        float: "float 5s ease-in-out infinite",
        pulseGlow: "pulseGlow 2.2s ease-in-out infinite",
        gradientShift: "gradientShift 7s ease infinite"
      }
    }
  },
  plugins: []
};

export default config;
