/** @type {import('tailwindcss').Config} */
export default {
  content: [ "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",],
  theme: {
    extend: {
      colors: {
        customColor: '#ff00ff', // Define a custom color with hex code
      },
    },
  },
  plugins: [require('daisyui')],
 
}

