// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: { 
      color:{
        'primary':"#5f6FFF"
      },
      gridTemplateColumns: {
        auto: "repeat(auto-fill, minmax(200px, 1fr))", // 👈 custom grid
      },
    },
  },
  plugins: [],
};
