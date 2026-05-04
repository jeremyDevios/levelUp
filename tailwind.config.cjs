/*
README (brief):
- Enable dark mode in dev by adding the "dark" class to <html> or <body>:
  document.documentElement.classList.add('dark')
- Import the global styles in your entry (src/main.tsx):
  import './styles/globals.css'
- Use CSS tokens defined in :root / .dark via var(--color-primary), var(--gradient-primary), var(--bg), var(--text), etc.
*/

module.exports = {
  darkMode: 'class', // use `.dark` on <html> or <body>
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F4941A',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
    // mobile-first breakpoints (Tailwind is mobile-first by default)
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
  },
  plugins: [],
};
