import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: { '2xl': '1200px' },
    },
    extend: {
      fontFamily: {
        poppins: ['var(--font-poppins)', 'sans-serif'],
      },
      colors: {
        tof: {
          navy: '#1B144C',
          purple: '#3B2F7A',
          teal: '#3EC8BC',
          mint: '#B4FFC8',
          orange: '#EA580C',
        },
      },
      borderRadius: {
        card: '20px',
      },
      boxShadow: {
        card: '0 10px 30px rgba(27, 20, 76, 0.08)',
        'card-hover': '0 15px 40px rgba(27, 20, 76, 0.14)',
      },
    },
  },
  plugins: [],
};

export default config;
