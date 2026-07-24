import classNames from 'classnames'
import React, { FC } from 'react'
import { Tooltip } from '@/shared/ui/Tooltip/Tooltip'

interface Props {
  externalId: string
  className?: string
}

export const ExternalId: FC<Props> = ({ externalId, className }) => {
  return (
    <Tooltip>
      <Tooltip.Trigger
        className={classNames(
          'p-2 rounded bg-hover body-12 flex justify-center items-center w-[62px]',
          className
        )}
      >
        <p className={'ellipsis'}>{externalId}</p>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content side={'top'} sideOffset={10}>
          {externalId}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip>
  )
}
