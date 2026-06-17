/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './blog.html'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: '#0A1626', ink2: '#0F2238',
        paper: '#F6F3EC', bone: '#EDE8DD',
        gdi: '#7C5CFF', blue: '#3B82F6', amber: '#E8A33D', teal: '#2FA88E', green: '#2FA86A',
      },
    },
  },
  plugins: [],
}
