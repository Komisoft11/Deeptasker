import classNames from 'classnames'
import { FC, ReactNode } from 'react'

interface LabelWithPopoverProps {
  label: string
  children: ReactNode
  className?: string
}

export const LabelWithPopover: FC<LabelWithPopoverProps> = ({
  label,
  children,
  className
}) => (
  <div className={classNames('flex gap-1 items-center py-1', className)}>
    {label && <p className='w-[170px] body-12 secondaryText'>{label}</p>}

    {children}
  </div>
)
