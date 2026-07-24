import { observer } from 'mobx-react-lite'
import { ReactNode, useEffect } from 'react'
import {
  DefaultTheme,
  ThemeProvider as ThemeProviderSC
} from 'styled-components'
import { ThemeType } from '@/entities/lib/stores/theme-mode.store'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'

interface Props {
  children: ReactNode
  theme?: DefaultTheme
}

export const defaultTheme: DefaultTheme = {
  colors: {
    primaryGray900: '#303640',
    primaryGray800: '#6E7379',
    primaryGray750: '#74747F',
    primaryGray700: '#ACAFB3',
    primaryGray600: '#D6D7D9',
    primaryGray500: '#EAEBEC',
    primaryGray400: '#F5F5F5',
    primaryGray300: '#F9F9F9',
    primaryGrayBlue900: '#768BA7',
    primaryGrayBlue800: '#ACBDD3',
    primaryGrayBlue700: '#CDD7E5',
    primaryGrayBlue600: '#EBEFF4',
    primaryGrayBlue500: '#F3F6FA',
    gray900: '#EAEEF4',
    gray800: '#F8FAFB',
    gray700: '#FCFDFD',
    blue900: '#2F7FEF',
    blue800: '#C1D9FB',
    blue700: '#EBF3FE',
    green900: '#18C4A9',
    green800: '#BAEEE6',
    green700: '#E8FAF7',
    red: '#EC5E5E',
    white: '#FFFFFF',
    priorityNo: '#303640',
    priorityHigh: '#EC5E5E',
    priorityMedium: '#FFEA88',
    priorityLow: '#C1D9FA',
    orange: '#E29909',
    yellow: '#ECCB1D',

    dropdownBg: '#FFFFFF'
  }
}

export const darkTheme: DefaultTheme = {
  colors: {
    primaryGray900: '#303640',
    primaryGray800: '#6E7379',
    primaryGray750: '#74747F',
    primaryGray700: '#ACAFB3',
    primaryGray600: '#D6D7D9',
    primaryGray500: '#EAEBEC',
    primaryGray400: '#F5F5F5',
    primaryGray300: '#F9F9F9',
    primaryGrayBlue900: '#768BA7',
    primaryGrayBlue800: '#ACBDD3',
    primaryGrayBlue700: '#CDD7E5',
    primaryGrayBlue600: '#EBEFF4',
    primaryGrayBlue500: '#F3F6FA',
    gray900: '#EAEEF4',
    gray800: '#F8FAFB',
    gray700: '#FCFDFD',
    blue900: '#2F7FEF',
    blue800: '#C1D9FB',
    blue700: '#EBF3FE',
    green900: '#18C4A9',
    green800: '#BAEEE6',
    green700: '#E8FAF7',
    red: '#EC5E5E',
    white: '#FFFFFF',
    priorityNo: '#303640',
    priorityHigh: '#EC5E5E',
    priorityMedium: '#FFEA88',
    priorityLow: '#C1D9FA',
    orange: '#E29909',
    yellow: '#ECCB1D',

    dropdownBg: '#393848'
  }
}

export const ThemeProvider = observer(({ children, theme }: Props) => {
  const { themeModeStore } = useRootStore()

  useEffect(() => {
    if (themeModeStore.mode === ThemeType.dark) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
  }, [themeModeStore.mode])

  return (
    <ThemeProviderSC theme={theme ?? defaultTheme}>{children}</ThemeProviderSC>
  )
})
