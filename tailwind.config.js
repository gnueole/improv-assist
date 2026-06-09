/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        irised: {
          cyan: "#00f0ff",
          yellow: "#ffea00",
          magenta: "#ff007f",
          purple: "#7000ff",
        },
      },
      backgroundImage: {
        "irised-gradient": "linear-gradient(135deg, #00f0ff 0%, #ffea00 33%, #ff007f 66%, #7000ff 100%)",
        "irised-gradient-glow": "linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(255, 234, 0, 0.15) 33%, rgba(255, 0, 127, 0.15) 66%, rgba(112, 0, 255, 0.15) 100%)",
      },
      animation: {
        "spin-slow": "spin 8s linear infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite alternate",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        glowPulse: {
          "0%": { boxShadow: "0 0 5px rgba(0, 240, 255, 0.2), 0 0 10px rgba(112, 0, 255, 0.2)" },
          "100%": { boxShadow: "0 0 15px rgba(255, 0, 127, 0.5), 0 0 25px rgba(112, 0, 255, 0.5)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
}
