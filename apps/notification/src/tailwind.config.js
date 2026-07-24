const tailwindConfig = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      inter: ['Inter', 'Arial', 'Helvetica', 'sans-serif']
    },
    extend: {
      colors: {
        bg: '#F7F7F8',
        textMain: '#1F2937',
        textSecond: '#707070',
        accent: '#3A7BFF',
        objects: '#F0F0F0',
        activeText: '#FFF',
        border: '#E6E8EC',
        hover: 'rgba(0, 0, 0, 0.04)'
      }
    }
  }
}

export default tailwindConfig
