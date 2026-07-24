// import original module declarations
import 'styled-components'

export interface IColorTheme {
  primaryGray900: string
  primaryGray800: string
  primaryGray750: string
  primaryGray700: string
  primaryGray600: string
  primaryGray500: string
  primaryGray400: string
  primaryGray300: string
  primaryGrayBlue900: string
  primaryGrayBlue800: string
  primaryGrayBlue700: string
  primaryGrayBlue600: string
  primaryGrayBlue500: string
  gray900: string
  gray800: string
  gray700: string
  blue900: string
  blue800: string
  blue700: string
  green900: string
  green800: string
  green700: string
  red: string
  white: string
  priorityNo: string
  priorityHigh: string
  priorityMedium: string
  priorityLow: string
  orange: string
  yellow: string

  dropdownBg: string
}

// and extend them!
declare module 'styled-components' {
  export interface DefaultTheme {
    colors: IColorTheme
  }
}
