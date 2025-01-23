/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      
      backgroundColor:{
        primary:"#3B82F6",
        light:"white",
        dark:"navy"
      },
      colors:{
        primary:"#3B82F6"
      },
    },
  },
  plugins: [],
}