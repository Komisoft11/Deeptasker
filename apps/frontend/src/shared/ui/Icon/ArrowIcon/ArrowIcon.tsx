import classNames from 'classnames'
import React, { DetailedHTMLProps, HTMLAttributes } from 'react'
import { CaretLeft } from '@/shared/assets/images/icons'

interface Props
  extends DetailedHTMLProps<
    HTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  direction?: 'left' | 'right' | 'top' | 'bottom'
}

export const ArrowIcon = ({
  className,
  direction = 'left',
  ...props
}: Props) => {
  const directionStyle: Record<NonNullable<Props['direction']>, string> = {
    left: 'rotate-0',
    top: 'rotate-90',
    right: '-rotate-180',
    bottom: '-rotate-90'
  }

  return (
    <button
      className={classNames(className)}
      aria-label={`Navigate ${direction}`}
      {...props}
    >
      <CaretLeft
        className={classNames(
          directionStyle[direction],
          'transition ease-linear duration-75 icon'
        )}
      />
    </button>
  )
}
