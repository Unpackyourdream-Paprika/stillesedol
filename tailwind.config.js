/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "kanye-accent": "#ff3d00",
      },
      fontFamily: {
        dinbek: ["DINBEKBold", "sans-serif"],
        hannaPro: ["BMHANNAPro", "sans-serif"], // 한나체 Pro 추가
        robotoMono: ["Roboto Mono", "sans-serif"],
        pretendart: ["Pretendard", 'sans-serif'],
      },
    },
  },
  plugins: [],
}; 