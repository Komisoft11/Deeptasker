import { ComponentPropsWithoutRef, FC } from 'react'
import logoImg from '@/shared/assets/images/logo.png'

export const Logo: FC<ComponentPropsWithoutRef<'img'>> = (props) => {
  return <img src={logoImg} alt={'Лого'} {...props} />
}
