const plugin = require('tailwindcss/plugin')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      inter: ['Inter']
    },
    zIndex: {
      1: '1',
      2: '2',
      3: '3',
      4: '4',
      5: '5',
      6: '6',
      container: '7',
      header: '8',
      modal: '9',
      portal: '10'
    },
    colors: {
      transparent: 'transparent'
    },
    extend: {
      colors: {
        bg: 'var(--bg)',
        textMain: 'var(--text-main)',
        textSecond: 'var(--text-second)',
        accent: 'var(--accent)',
        objects: 'var(--objects)',
        hover: 'var(--hover)',
        overlay: 'var(--overlay)',
        systemRed: 'var(--system-red)',
        systemGreen: 'var(--system-green)',
        systemYellow: 'var(--system-yellow)',
        hoverOnHover: 'var(--hover-on-hover)',
        activeText: 'var(--activeText)',
        accent60: 'var(--accent-60)',
        border: 'var(--border)'
      }
    }
  },
  plugins: [
    plugin(({ addUtilities, matchUtilities }) => {
      matchUtilities({})
      addUtilities({
        '.flex-center-between': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }
      })
    })
  ]
}
