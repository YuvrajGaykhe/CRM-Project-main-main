/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', '"Segoe UI"', 'system-ui', 'sans-serif'],
      },
      colors: {
        sigma: {
          bg: 'var(--sigma-bg)',
          surface: 'var(--sigma-surface)',
          'surface-raised': 'var(--sigma-surface-raised)',
          border: 'var(--sigma-border)',
          text: 'var(--sigma-text)',
          muted: 'var(--sigma-muted)',
          accent: 'var(--sigma-accent)',
          'accent-hover': 'var(--sigma-accent-hover)',
          success: 'var(--sigma-success)',
          warning: 'var(--sigma-warning)',
          danger: 'var(--sigma-danger)',
          info: 'var(--sigma-info)',
        },
      },
      borderRadius: {
        sigma: 'var(--sigma-radius-md)',
      },
    },
  },
  plugins: [],
}