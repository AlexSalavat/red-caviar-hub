/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "brand-red": "#B5121B",
        "brand-slate": "#0F172A",
        "brand-cream": "#FFF3E9",
        "brand-verify": "#19A974"
      }
    }
  },
  plugins: []
}
