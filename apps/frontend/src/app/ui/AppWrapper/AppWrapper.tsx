import { ReactNode } from 'react'
import { NotMobileApp } from '@/pages/NotMobileApp/NotMobileApp'
import { useBreakpoints } from '@/shared/lib/hooks/useBreakpoints'

interface Props {
  children: ReactNode
}

export const AppWrapper = ({ children }: Props) => {
  const { IS_MOBILE_OR_TABLET } = useBreakpoints()

  if (IS_MOBILE_OR_TABLET) {
    return <NotMobileApp />
  }
  return <>{children}</>
}
