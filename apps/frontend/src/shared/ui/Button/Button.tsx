import classNames from 'classnames'
import {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  MouseEventHandler,
  ReactNode
} from 'react'
import styles from './Button.module.scss'


type TypeStyleButton = 'filled' | 'outline'
type TypeColorButton = 'accent' | 'red' | 'dark' | 'green' | 'transparent'

export interface IButtonProps
  extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  children?: ReactNode
  styleButton: TypeStyleButton
  colorButton?: TypeColorButton
  loading?: boolean
  icon?: ReactNode
  onClick?: MouseEventHandler<HTMLButtonElement>
}

export const Button = ({
  children,
  styleButton,
  className,
  colorButton,
  loading,
  style,
  disabled,
  icon,
  onClick,
  ...props
}: IButtonProps) => {
  return (
    <button
      type={'button'}
      className={classNames(
        'content-center gap-2',
        styles[styleButton],
        colorButton && styles[colorButton],
        className
      )}
      style={loading ? { position: 'relative', width: '5rem' } : style}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {icon && icon} {children}
    </button>
  )
}
