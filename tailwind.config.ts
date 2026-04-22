import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#140a2e',
        panel: '#221042',
        panel2: '#2a1451',
        line: '#4f2c8d',
        accent: '#9b5cff',
        accent2: '#ff70ea',
        mint: '#73f0b2'
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(162,95,255,.25), 0 18px 60px rgba(64,24,126,.35)',
        neon: '0 0 40px rgba(164,95,255,.35)',
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(circle at top, rgba(149,93,255,0.35), transparent 28%), linear-gradient(180deg, #1a0d3a 0%, #120924 100%)',
        'card-glow': 'linear-gradient(180deg, rgba(49,25,92,0.95), rgba(28,13,55,0.97))'
      }
    },
  },
  plugins: [],
}

export default config
