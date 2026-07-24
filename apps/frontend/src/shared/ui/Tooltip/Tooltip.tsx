import {
  Root,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger
} from '@radix-ui/react-tooltip'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, {
  ComponentPropsWithoutRef,
  FC,
  ReactNode,
  forwardRef
} from 'react'
import './Tooltip.scss'

interface DotNotation {
  Trigger: typeof TooltipTriggerComponent
  Content: typeof TooltipContentComponent
  Portal: typeof TooltipPortalComponent
}

interface TooltipProps {
  children: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  delayDuration?: number
  disableHoverableContent?: boolean
}

export const Tooltip: FC<TooltipProps> & DotNotation = ({
  children,
  ...props
}) => {
  return (
    <TooltipProvider>
      <Root {...props}>{children}</Root>
    </TooltipProvider>
  )
}

const TooltipTriggerComponent = forwardRef<
  React.ElementRef<typeof TooltipTrigger>,
  ComponentPropsWithoutRef<typeof TooltipTrigger>
>(({ className, children, ...props }, ref) => {
  return (
    <TooltipTrigger
      ref={ref}
      className={classNames('DT_Tooltip_Trigger', className)}
      {...props}
    >
      {children}
    </TooltipTrigger>
  )
})

const TooltipContentComponent = forwardRef<
  React.ElementRef<typeof TooltipContent>,
  ComponentPropsWithoutRef<typeof TooltipContent>
>(({ children, className, sideOffset = 8, ...props }, ref) => {
  return (
    <TooltipContent
      ref={ref}
      className={classNames('DT_Tooltip_Content', 'body-12', className)}
      sideOffset={sideOffset}
      {...props}
    >
      <div className='DT_Tooltip_Arrow' data-side={props.side ?? 'top'} />
      {children}
    </TooltipContent>
  )
})

const TooltipPortalComponent = ({
  children,
  ...props
}: ComponentPropsWithoutRef<typeof TooltipPortal>) => {
  return <TooltipPortal {...props}>{children}</TooltipPortal>
}

Tooltip.Trigger = TooltipTriggerComponent
Tooltip.Content = TooltipContentComponent
Tooltip.Portal = TooltipPortalComponent

Tooltip.propTypes = {
  open: PropTypes.bool,
  defaultOpen: PropTypes.bool,
  onOpenChange: PropTypes.func,
  delayDuration: PropTypes.number,
  disableHoverableContent: PropTypes.bool
}
