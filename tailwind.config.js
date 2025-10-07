/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#2eff66'
      },
      boxShadow: {
        's-custom': 'inset 0 1px 2px #ffffff30, 0 1px 2px #00000036, 0 2px 4px #00000015',
        'm-custom': 'ins et 0 1px 2px #ffffff50, 0 2px 4px #00000036, 0 4px 8px #00000015',
      },
      
  
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
};
