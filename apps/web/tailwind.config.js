/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        fun: ["Fredoka", "sans-serif"],
      },
      colors: {
        rps: {
          blue: "#4285F4",
          "blue-light": "#7BAAF7",
          "blue-dark": "#3367D6",
          red: "#EA4335",
          "red-light": "#F28B82",
          "red-dark": "#C5221F",
          yellow: "#FBBC04",
          "yellow-light": "#FDD663",
          "yellow-dark": "#E8A800",
        },
      },
      borderWidth: {
        3: "3px",
      },
      keyframes: {
        "bounce-in": {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(66, 133, 244, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(66, 133, 244, 0.6)" },
        },
      },
      animation: {
        "bounce-in": "bounce-in 0.6s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
