/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./App.{js,jsx,ts,tsx}",
      "./src/**/*.{js,jsx,ts,tsx}"
    ],
    theme: {
      extend: {
        colors: {
          primary: '#1368A4',
          secondary: '#34A853', // Using accent color from theme
          background: '#FFFFFF',
          'surface': '#F5F5F5',
          'surface-variant': '#F2F2F7',
          'on-background': '#202124', // Using text color from theme
          'on-surface': '#202124',
          'on-surface-variant': '#5F6368', // Using placeholder color
          'on-primary': '#FFFFFF',
          'outline': '#9AA0A6', // Using disabled color
          'error': '#EA4335',
        },
      },
    },
    plugins: [],
  }