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
      },
      boxShadow: {
        'elev-1': '0 6px 18px rgba(15,23,42,0.06)',
        'elev-2': '0 10px 30px rgba(15,23,42,0.10)',
      },
      borderRadius: {
        'app-lg': '16px',
        'app-xl': '20px',
        'app-2xl': '24px',
      }
    }
  },
  plugins: []
}
