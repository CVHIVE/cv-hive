export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F52BA',
          hover: '#0D4299',
        },
        accent: {
          DEFAULT: '#00A651',
        },
      },
    },
  },
  plugins: [],
}
