module.exports = {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: '#1e1e1e',
        light: '#f5f5f5',
        primary: '#3b82f6',
        secondary: '#9333ea',
      },
    },
  },
  darkMode: 'class', // Aktivierung des dunklen Modus
  plugins: [],
};