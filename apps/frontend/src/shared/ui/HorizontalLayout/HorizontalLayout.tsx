import classNames from 'classnames'
import { ReactNode } from 'react'
import styles from './HorizontalLayout.module.scss'

interface Props {
  labelText: string
  labelDescription?: string
  noBorder?: boolean
  children: ReactNode
  className?: string
  containerClassName?: string
  isSettingsPage?: boolean
  containerChildren?: ReactNode
}

export const HorizontalLayout = ({
  labelText,
  labelDescription,
  noBorder = false,
  children,
  className,
  isSettingsPage = false,
  containerClassName,
  containerChildren
}: Props) => {
  return (
    <div
      className={classNames(
        styles.container,
        noBorder && styles.noBorder,
        containerClassName
      )}
    >
      <div
        className={classNames(
          'flex flex-col justify-between h-full max-w-[260px]',
          className
        )}
      >
        <div className={'flex flex-col gap-2'}>
          {isSettingsPage ? (
            <h4>{labelText}</h4>
          ) : (
            <p className={'body-14-16'}>{labelText}</p>
          )}
          {labelDescription && (
            <p className={'body-12 secondaryText'}>{labelDescription}</p>
          )}
        </div>
        {containerChildren && containerChildren}
      </div>
      {children}
    </div>
  )
}
