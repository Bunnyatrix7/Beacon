/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"]
      },
      boxShadow: {
        glass: "0 24px 80px rgba(0, 0, 0, 0.22)",
        glow: "0 0 34px rgba(125, 211, 252, 0.26)"
      },
      backdropBlur: {
        glass: "26px"
      }
    }
  },
  plugins: []
};
