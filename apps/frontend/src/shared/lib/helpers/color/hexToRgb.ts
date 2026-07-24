import { RGBColor } from 'react-color'

export const hexToRgb = (hex: string): RGBColor => {
  // Remove the hash symbol if present
  hex = hex.replace('#', '')

  // Extract the red, green, and blue ui
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  // Return the RGB values as an object
  return { r, g, b }
}

export const hexToRgba = (hex: string, alpha: number): string => {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
