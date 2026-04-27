import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'background-dark': '#121212',
        'surface-color': '#1E1E1E',
        'primary-accent': '#BB86FC',
        'secondary-accent': '#03DAC6',
        'text-primary': '#FFFFFF',
        'text-secondary': '#B3B3B3',
      },
      fontFamily: {
        poppins: ['var(--font-poppins)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
