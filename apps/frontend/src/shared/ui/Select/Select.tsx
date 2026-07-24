import {
  Content,
  Item,
  ItemText,
  Portal,
  Root,
  SelectContentProps,
  SelectItemProps,
  SelectPortalProps,
  SelectProps,
  SelectTriggerProps,
  SelectValueProps,
  SelectViewportProps,
  Trigger,
  Value,
  Viewport
} from '@radix-ui/react-select'
import classNames from 'classnames'
import { FC, forwardRef } from 'react'
import './Select.scss'

interface DotNotation {
  Item: typeof SelectItem
  Trigger: typeof SelectTrigger
  Portal: typeof PortalSelect
  Content: typeof ContentSelect
}

interface Props extends SelectProps {}

export const Select: FC<Props> & DotNotation = ({ children, ...props }) => {
  return <Root {...props}>{children}</Root>
}

const PortalSelect: FC<SelectPortalProps> = (props) => {
  return <Portal {...props}>{props.children}</Portal>
}

const SelectTrigger = forwardRef<
  HTMLButtonElement,
  SelectTriggerProps & SelectValueProps
>(({ placeholder, className, ...props }, ref) => {
  return (
    <Trigger
      className={classNames('DT_Select_Trigger', className)}
      {...props}
      ref={ref}
    >
      <Value placeholder={placeholder}>
        <div className={'flex gap-2'}>{props.children}</div>
      </Value>
    </Trigger>
  )
})

interface ContentProps extends SelectContentProps {
  viewportProps?: SelectViewportProps
  viewportClassName?: string
}

const ContentSelect: FC<ContentProps> = ({
  children,
  className,
  viewportProps,
  viewportClassName,
  ...props
}) => {
  return (
    <Content
      sideOffset={12}
      position={'popper'}
      align={'center'}
      className={classNames('DT_Select_Content', className)}
      {...props}
    >
      <div className={'overflow-y-auto scrollbarContainerOnObjects'}>
        <Viewport className={viewportClassName} {...viewportProps}>
          {children}
        </Viewport>
      </div>
    </Content>
  )
}

interface SelectItemCustomProps extends SelectItemProps {
  isComplex?: boolean
}

const SelectItem = forwardRef<HTMLDivElement, SelectItemCustomProps>(
  ({ children, className, isComplex = false, ...props }, ref) => {
    return (
      <Item
        className={classNames('DT_Select_Item', className)}
        {...props}
        ref={ref}
      >
        {isComplex ? children : <ItemText>{children}</ItemText>}
      </Item>
    )
  }
)

Select.Trigger = SelectTrigger
Select.Item = SelectItem
Select.Portal = PortalSelect
Select.Content = ContentSelect
