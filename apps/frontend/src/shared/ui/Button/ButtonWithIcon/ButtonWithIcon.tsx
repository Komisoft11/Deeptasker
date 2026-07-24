import classNames from 'classnames'
import { ReactNode } from 'react'
import { Button, IButtonProps } from '@/shared/ui/Button/Button'
import styles from './ButtonWithIcon.module.scss'

interface Props extends IButtonProps {
  icon: ReactNode
  buttonClassName?: string
}

export const ButtonWithIcon = ({
  icon,
  children,
  buttonClassName,
  ...props
}: Props) => {
  return (
    <Button {...props} className={classNames(styles.button, buttonClassName)}>
      {icon}
      {children}
    </Button>
  )
}
