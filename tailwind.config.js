/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontFamily: {
      sans: ['var(--font-nunito)', 'Nunito', 'sans-serif'],
      mono: ['var(--font-nunito-sans)', 'Nunito Sans', 'monospace'],
    },
  },
};

export default config;
