import { RGBColor } from 'react-color'

export const rgbToHex = (rgb: RGBColor) => {
  return (
    '#' + componentToHex(rgb.r) + componentToHex(rgb.g) + componentToHex(rgb.b)
  )
}

function componentToHex(c: number) {
  let hex = c.toString(16)
  return hex.length == 1 ? '0' + hex : hex
}
