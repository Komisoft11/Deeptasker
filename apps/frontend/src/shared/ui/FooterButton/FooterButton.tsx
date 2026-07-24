import classNames from 'classnames'
import { ComponentProps, ElementType, MouseEventHandler } from 'react'
import { Button } from '@/shared/ui/Button/Button'
import styles from './FooterButton.module.scss'

interface Props extends ComponentProps<typeof Button> {
  buttonText: string
  Icon?: ElementType
  onClick?: MouseEventHandler<HTMLButtonElement>
  secondButtonText?: string
  secondOnClick?: MouseEventHandler<HTMLButtonElement>
  type?: 'button' | 'submit'
  secondColorButton?: string
  buttonClassName?: string
  isAbsolute?: boolean
}

export const FooterButton = ({
  buttonText,
  Icon,
  onClick,
  colorButton,
  styleButton,
  className,
  children,
  type = 'button',
  buttonClassName,
  isAbsolute
}: Props) => {
  return (
    <div
      className={classNames(
        styles.buttonContainer,
        isAbsolute && 'absolute left-0 bottom-0',
        className
      )}
    >
      <Button
        styleButton={styleButton}
        colorButton={colorButton}
        className={classNames(styles.addButton, buttonClassName)}
        onClick={onClick}
        type={type}
      >
        <p className={'body-16 flex gap-2 items-center'}>
          {Icon && <Icon className={'w-5 h-5'} />}
          {buttonText}
        </p>
      </Button>
      {children && children}
    </div>
  )
}
