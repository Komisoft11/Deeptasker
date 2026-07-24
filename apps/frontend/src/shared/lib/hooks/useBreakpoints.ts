import { useMediaQuery } from 'react-responsive'

interface MediaBreackpointDescription {
  name: string
  minWidth: number | undefined
  maxWidth: number | undefined
}

interface MediaBreakpoint {
  mobileSmall: MediaBreackpointDescription
  mobileMedium: MediaBreackpointDescription
  mobileLarge: MediaBreackpointDescription
  tabletPortrait: MediaBreackpointDescription
  tabletLandscape: MediaBreackpointDescription
  desktopStandard: MediaBreackpointDescription
  desktopLarge: MediaBreackpointDescription
  desktopBig: MediaBreackpointDescription
}

const breakpoints: MediaBreakpoint = {
  mobileSmall: {
    name: 'Маленькие мобильные устройства',
    minWidth: 0,
    maxWidth: 320
  },
  mobileMedium: {
    name: 'Средние мобильные устройства',
    minWidth: 321,
    maxWidth: 480
  },
  mobileLarge: {
    name: 'Большие мобильные устройства',
    minWidth: 481,
    maxWidth: 767
  },
  tabletPortrait: {
    name: 'Планшеты (портретный режим)',
    minWidth: 768,
    maxWidth: 991
  },
  tabletLandscape: {
    name: 'Планшеты (альбомный режим)',
    minWidth: 992,
    maxWidth: 1199
  },
  desktopStandard: {
    name: 'Стандартные десктопы',
    minWidth: 1200,
    maxWidth: 1599
  },
  desktopLarge: {
    name: 'Большие экраны десктопов',
    minWidth: 1600,
    maxWidth: 2000
  },
  desktopBig: {
    name: 'Супер Большие экраны десктопов',
    minWidth: 2001,
    maxWidth: Infinity
  }
}

export interface BreakpointsReturn {
  isMobileSmall: boolean
  isMobileMedium: boolean
  isMobileLarge: boolean
  isTabletPortrait: boolean
  isTabletLandscape: boolean
  isDesktopStandard: boolean
  isDesktopLarge: boolean
  isDesktopBig: boolean
  IS_MOBILE_OR_TABLET: boolean
  IS_MOBILE: boolean
  IS_MOBILE_OR_TABLET_PORTRAIT: boolean
}

export const useBreakpoints = (): BreakpointsReturn => {
  const isMobileSmall = useMediaQuery({
    minWidth: breakpoints.mobileSmall.minWidth,
    maxWidth: breakpoints.mobileSmall.maxWidth
  })
  const isMobileMedium = useMediaQuery({
    minWidth: breakpoints.mobileMedium.minWidth,
    maxWidth: breakpoints.mobileMedium.maxWidth
  })
  const isMobileLarge = useMediaQuery({
    minWidth: breakpoints.mobileLarge.minWidth,
    maxWidth: breakpoints.mobileLarge.maxWidth
  })
  const isTabletPortrait = useMediaQuery({
    minWidth: breakpoints.tabletPortrait.minWidth,
    maxWidth: breakpoints.tabletPortrait.maxWidth
  })
  const isTabletLandscape = useMediaQuery({
    minWidth: breakpoints.tabletLandscape.minWidth,
    maxWidth: breakpoints.tabletLandscape.maxWidth
  })
  const isDesktopStandard = useMediaQuery({
    minWidth: breakpoints.desktopStandard.minWidth,
    maxWidth: breakpoints.desktopStandard.maxWidth
  })
  const isDesktopLarge = useMediaQuery({
    minWidth: breakpoints.desktopLarge.minWidth,
    maxWidth: breakpoints.desktopLarge.maxWidth
  })

  const isDesktopBig = useMediaQuery({
    minWidth: breakpoints.desktopBig.minWidth,
    maxWidth: breakpoints.desktopBig.maxWidth
  })

  const IS_MOBILE_OR_TABLET =
    isMobileLarge ||
    isMobileSmall ||
    isMobileMedium ||
    isTabletLandscape ||
    isTabletPortrait
  const IS_MOBILE = isMobileLarge || isMobileSmall || isMobileMedium
  const IS_MOBILE_OR_TABLET_PORTRAIT = IS_MOBILE || isTabletPortrait

  return {
    isMobileSmall,
    isMobileMedium,
    isMobileLarge,
    isTabletPortrait,
    isTabletLandscape,
    isDesktopStandard,
    isDesktopLarge,
    isDesktopBig,
    IS_MOBILE_OR_TABLET,
    IS_MOBILE,
    IS_MOBILE_OR_TABLET_PORTRAIT
  }
}