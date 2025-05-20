/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "../html/**/*.{html,js}",
    "../js/**/*.{js}",
    "../node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('flowbite/plugin')
  ],
}
