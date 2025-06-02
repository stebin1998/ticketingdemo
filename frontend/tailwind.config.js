/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'ticketmi-primary': '#3B82F6', // Bright blue for primary elements
        'ticketmi-secondary': '#6366F1', // Secondary accent color
        'ticketmi-text': '#1F2937', // Dark text
        'ticketmi-neutral': '#F9FAFB', // Light background
        'ticketmi-error': '#EF4444', // Error red
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      maxWidth: {
        '7xl': '80rem',
      },
    },
  },
  plugins: [],
};
