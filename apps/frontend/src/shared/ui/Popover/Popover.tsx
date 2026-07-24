import {
  Anchor,
  Content,
  PopoverAnchorProps,
  PopoverContentProps,
  PopoverProps,
  PopoverTriggerProps,
  Root,
  Trigger
} from '@radix-ui/react-popover'
import { Portal } from '@radix-ui/react-select'
import classNames from 'classnames'
import { FC, forwardRef } from 'react'
import './Popover.scss'

interface DotNotation {
  Content: typeof PopoverContent
  Trigger: typeof PopoverTrigger
  Anchor: typeof PopoverAnchor
}

interface Props extends PopoverProps {}

export const Popover: FC<Props> & DotNotation = ({ children, ...props }) => {
  return <Root {...props}>{children}</Root>
}

const PopoverTrigger = forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ children, disabled, className, ...props }, ref) => {
    return (
      <Trigger
        {...props}
        disabled={disabled}
        className={classNames(disabled && 'disabled', className)}
        ref={ref}
      >
        {children}
      </Trigger>
    )
  }
)

interface PropsPopoverContent extends PopoverContentProps {
  container?: Element | null
}

const PopoverContent = forwardRef<HTMLDivElement, PropsPopoverContent>(
  ({ children, className, container, ...props }, anchorRef) => {
    return (
      <Portal container={container ?? document.body}>
        <Content
          sideOffset={5}
          className={classNames('DT_Popover_Content', className)}
          {...props}
          ref={anchorRef}
        >
          {children}
        </Content>
      </Portal>
    )
  }
)

const PopoverAnchor = forwardRef<HTMLDivElement, PopoverAnchorProps>(
  (props, ref) => {
    return <Anchor {...props} ref={ref} />
  }
)

Popover.Trigger = PopoverTrigger
Popover.Content = PopoverContent
Popover.Anchor = PopoverAnchor
