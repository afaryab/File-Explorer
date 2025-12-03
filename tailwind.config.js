/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.{html,js}",
    "./views/**/*.{html,ejs}"
  ],
  theme: {
    extend: {
      colors: {
        'win11-blue': '#0078D4',
        'win11-bg': '#F3F3F3',
        'win11-sidebar': '#F9F9F9',
        'win11-hover': '#E5E5E5',
      },
    },
  },
  plugins: [],
}
