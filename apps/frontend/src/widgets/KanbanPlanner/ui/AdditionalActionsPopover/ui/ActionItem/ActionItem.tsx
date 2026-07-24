import classNames from 'classnames'
import React, { FC, SVGProps } from 'react'

interface ActionProps {
  text: string
  Icon: FC<SVGProps<SVGSVGElement>>
  canDelete?: boolean
  onClick?: () => void
}

export const ActionItem: FC<ActionProps> = ({
  text,
  Icon,
  canDelete = false,
  onClick
}) => (
  <div
    className='flex items-center hover:bg-hover py-1 pr-2 rounded-lg'
    onClick={onClick}
  >
    <div className='p-2'>
      <Icon className={classNames('icon w-5 h-5', canDelete && 'iconRed')} />
    </div>
    <p
      className={classNames(
        canDelete ? 'text-systemRed' : undefined,
        'body-14-16'
      )}
    >
      {text}
    </p>
  </div>
)
