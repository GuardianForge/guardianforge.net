/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "forgebg": "#161D28",
        dark1: "#1E1D2B",
        dark2: "#252736",
        dark3: "#353648",
        accent1: "#0177FB",
        accent2: "#124383",
        buttonBg: "#052247",
        icon: "#626277",
        border: "#242534",
        text: "#e5e5e5",
        text2: "#aaaaaa",
        "socket-icon-bg": "#111111",
        highlight: "yellow"
      }
    },
  },
  plugins: [],
}
