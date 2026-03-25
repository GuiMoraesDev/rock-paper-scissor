/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
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
    },
  },
  plugins: [],
};
