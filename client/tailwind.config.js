/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F9F8F6',
        surface: '#FFFFFF',
        ink: '#1C1B19',
        'ink-muted': '#6B6560',
        accent: '#5B7C6E',
      },
    },
  },
  plugins: [],
};
