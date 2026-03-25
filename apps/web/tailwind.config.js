/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
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
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "shake-x": {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "75%": { transform: "translateX(5px)" },
        },
      },
      animation: {
        "bounce-in": "bounce-in 0.6s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "slide-in-left": "slide-in-left 0.5s ease-out",
        "gradient-shift": "gradient-shift 8s ease infinite",
        float: "float 3s ease-in-out infinite",
        "shake-x": "shake-x 0.3s ease-in-out",
      },
    },
  },
  plugins: [],
};
