const flowbite = require("flowbite-react/tailwind");
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    flowbite.content(),],
    
  theme: {
    extend: {
      fontFamily: {
        jost: ["Jost", "sans-serif"], // Add Jost to Tailwind
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
    
    },
  },
  plugins: [
    require("flowbite/plugin"),
    require('@tailwindcss/typography'),
  ],
}