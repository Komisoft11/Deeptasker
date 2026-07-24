import * as TabsRadix from '@radix-ui/react-tabs'
import classNames from 'classnames'
import { FC } from 'react'
import './Tabs.scss'

interface DotNotation {
  Content: typeof TabsContent
  Trigger: typeof TabsTrigger
  List: typeof TabsList
}

/** Anatomy
 // <Tabs.Root>
 //   <Tabs.List>
 //     <Tabs.Trigger />
 //   </Tabs.List>
 //   <Tabs.Content />
 // </Tabs.Root>
 */

export const Tabs: FC<TabsRadix.TabsProps> & DotNotation = ({
  children,
  ...props
}) => {
  return (
    <TabsRadix.Root
      className={classNames('flex flex-col gap-4 h-full', props.className)}
      {...props}
    >
      {children}
    </TabsRadix.Root>
  )
}

const TabsList = ({
  children,
  className,
  ...props
}: TabsRadix.TabsListProps) => {
  return (
    <TabsRadix.List className={classNames('DT_Tab_List', className)} {...props}>
      {children}
    </TabsRadix.List>
  )
}

const TabsContent = ({
  children,
  className,
  ...props
}: TabsRadix.TabsContentProps) => {
  return (
    <TabsRadix.Content className={classNames('h-full', className)} {...props}>
      {children}
    </TabsRadix.Content>
  )
}

const TabsTrigger = ({
  children,
  className,
  disabled,
  ...props
}: TabsRadix.TabsTriggerProps) => {
  return (
    <TabsRadix.Trigger
      className={classNames(
        'DT_Tab_Trigger body-14-16',
        disabled && 'disabled-30',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </TabsRadix.Trigger>
  )
}

Tabs.Trigger = TabsTrigger
Tabs.List = TabsList
Tabs.Content = TabsContent
