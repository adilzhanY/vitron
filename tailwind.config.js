/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
                benzin: ["Benzin-Regular", "sans-serif"],
                benzinBold: ["Benzin-Bold", "sans-serif"],
                benzinExtraBold: ["Benzin-ExtraBold", "sans-serif"],
                benzinMedium: ["Benzin-Medium", "sans-serif"],
                benzinSemiBold: ["Benzin-Semibold", "sans-serif"],
            },
    },
  },
  plugins: [],
}