export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F6F2ED",
        section: "#EFE9E2",
        primary: "#2B2B2B",
        muted: "#7A726C",
        accent: "#C47A3A",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
