import classNames from 'classnames'
import React, { FC, SVGProps } from 'react'
import { TextEditorMode } from '@/widgets/MantineTextEditor/MantineTextEditor'
import { Button } from '@/shared/ui/Button/Button'
import { Tooltip } from '@/shared/ui/Tooltip/Tooltip'

interface EditorButtonProps {
  action: () => void
  isActive?: boolean
  Icon?: FC<SVGProps<SVGSVGElement>>
  command?: string
  disabled?: boolean
  label?: string
  className?: string
  shortcut?: string
  tooltipContent?: string
  mode: TextEditorMode
}

export const EditorButton: FC<EditorButtonProps> = ({
  action,
  isActive,
  Icon,
  disabled,
  label,
  command,
  className,
  shortcut,
  tooltipContent,
  mode
}) => {
  return tooltipContent ? (
    <Tooltip>
      <Tooltip.Trigger
        className={classNames(
          'h-max p-2 button transition-colors',
          isActive && 'bg-accent',
          !isActive && 'hover:bg-hover',
          disabled && 'opacity-30 pointer-events-none'
        )}
        onClick={(e) => {
          e.stopPropagation()
          action()
        }}
        type={'button'}
      >
        <div className={'flex gap-2 items-center'}>
          {Icon && (
            <Icon
              className={classNames('w-4 h-4', isActive ? undefined : 'icon')}
            />
          )}{' '}
          {label ?? label}
        </div>
        {shortcut && !tooltipContent && (
          <p className={'secondaryText'}>{shortcut} </p>
        )}
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content side={'top'} sideOffset={10} className={'flex gap-2'}>
          {tooltipContent}
          <span className={'secondaryText'}>{shortcut}</span>
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip>
  ) : (
    <Button
      onClick={action}
      disabled={disabled}
      colorButton={isActive ? 'accent' : 'transparent'}
      styleButton='filled'
      aria-label={command}
      className={classNames('p-2 rounded-lg justify-between', className)}
    >
      <div className={'flex gap-2 items-center'}>
        {Icon && (
          <Icon
            className={classNames(isActive ? undefined : 'icon', 'w-4 h-4')}
          />
        )}{' '}
        <p
          className={classNames(
            'body-14-16',
            isActive ? 'text-activeText' : 'text-textMain'
          )}
        >
          {label ?? label}
        </p>
      </div>
      {shortcut && !tooltipContent && (
        <p
          className={classNames(
            isActive ? 'text-activeText' : 'secondaryText',
            'body-12'
          )}
        >
          {shortcut}{' '}
        </p>
      )}
    </Button>
  )
}
