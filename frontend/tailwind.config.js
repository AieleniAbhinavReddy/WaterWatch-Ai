/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  safelist: [
    "text-red-600", "text-red-500", "text-red-400",
    "text-yellow-600", "text-yellow-500", "text-yellow-400",
    "text-green-600", "text-green-500", "text-green-400",
    "text-emerald-600",
    "bg-red-50", "bg-red-500", "bg-red-100",
    "bg-yellow-50", "bg-yellow-500", "bg-yellow-100",
    "bg-green-50", "bg-green-500", "bg-green-100",
    "bg-emerald-50", "bg-emerald-500",
    "border-red-200", "border-yellow-200", "border-green-200",
    "ring-red-500", "ring-yellow-500", "ring-green-500",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
          950: "#083344",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
