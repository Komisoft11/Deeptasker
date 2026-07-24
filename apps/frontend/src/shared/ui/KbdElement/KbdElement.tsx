import classNames from 'classnames'
import { ReactNode } from 'react'
import { Tooltip } from '@/shared/ui/Tooltip/Tooltip'
import styles from './KbdElement.module.scss'

interface Props {
  kdb: string | ReactNode
  tooltipContent: string
  className?: string
  side?: 'left' | 'right' | 'top' | 'bottom' | undefined
}

export const KbdElement = ({
  kdb,
  tooltipContent,
  className,
  side = 'top'
}: Props) => {
  return (
    <Tooltip>
      <Tooltip.Trigger
        className={classNames(
          typeof kdb === 'string' && styles.kbd,
          'body-12 secondaryText',
          className
        )}
        type={'button'}
      >
        {typeof kdb === 'string' ? <kbd>{kdb}</kbd> : kdb}
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content side={side} sideOffset={10}>
          {tooltipContent}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip>
  )
}
