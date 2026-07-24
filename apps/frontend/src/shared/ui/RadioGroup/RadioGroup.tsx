import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import classNames from 'classnames'
import React, { forwardRef } from 'react'
import styles from './RadioGroup.module.scss'

export interface RadioOption {
  label: string
  value: string
}

type RadioGroupRootProps = React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Root
>

type RadioGroupItemProps = React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Item
>

type RadioGroupIndicatorProps = React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Indicator
>

const RadioGroupRoot = forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupRootProps
>(({ className, ...props }, ref) => {
  return <RadioGroupPrimitive.Root ref={ref} className={className} {...props} />
})

RadioGroupRoot.displayName = 'RadioGroup'

const RadioGroupItem = forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={classNames(styles.item, className)}
      {...props}
    />
  )
})

RadioGroupItem.displayName = 'RadioGroupItem'

const RadioGroupIndicator = forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Indicator>,
  RadioGroupIndicatorProps
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Indicator
      ref={ref}
      className={classNames('', className)}
      {...props}
    />
  )
})

RadioGroupIndicator.displayName = 'RadioGroupIndicator'

interface RadioGroupLabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const RadioGroupLabel = ({ className, ...props }: RadioGroupLabelProps) => {
  return (
    <label className={classNames('cursor-pointer', className)} {...props} />
  )
}

interface RadioGroupOptionsProps {
  options: RadioOption[]
  itemClassName?: string
  labelClassName?: string
}

const RadioGroupOptions = ({
  options,
  labelClassName,
  itemClassName
}: RadioGroupOptionsProps) => {
  return (
    <>
      {options.map((option) => (
        <RadioGroupLabel key={option.value} className={labelClassName}>
          <RadioGroup.Item value={option.value} className={itemClassName}>
            {option.label}
          </RadioGroup.Item>
        </RadioGroupLabel>
      ))}
    </>
  )
}

type RadioGroupComponent = typeof RadioGroupRoot & {
  Item: typeof RadioGroupItem
  Indicator: typeof RadioGroupIndicator
  Label: typeof RadioGroupLabel
  Options: typeof RadioGroupOptions
}

const RadioGroup = RadioGroupRoot as RadioGroupComponent

RadioGroup.Item = RadioGroupItem
RadioGroup.Indicator = RadioGroupIndicator
RadioGroup.Label = RadioGroupLabel
RadioGroup.Options = RadioGroupOptions

export { RadioGroup }
