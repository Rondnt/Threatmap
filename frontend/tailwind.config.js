/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors for threat levels
        'critical': '#dc2626',
        'high': '#ea580c',
        'medium': '#f59e0b',
        'low': '#10b981',
        'info': '#3b82f6',
      }
    },
  },
  plugins: [],
}
