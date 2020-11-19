module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
    container: {
      center: true,
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
  purge: {
    content: ["./src/**/*.html", "./public/index.html", "./src/**/*.tsx"],
  },
};
