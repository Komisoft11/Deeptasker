import * as SwitchRadix from '@radix-ui/react-switch'
import classNames from 'classnames'
import { ReactNode, forwardRef, useId } from 'react'
import './Switch.scss'

export interface SwitchProps extends SwitchRadix.SwitchProps {
  label?: ReactNode
  containerClassName?: string
  labelClassName?: string
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, containerClassName, label, labelClassName, ...props }, ref) => {
    const id = useId()
    return (
      <div className={containerClassName}>
        {label && (
          <label htmlFor={id} className={labelClassName}>
            {label}
          </label>
        )}
        <SwitchRadix.Root
          id={id}
          ref={ref}
          className={classNames('DT_Switch_Root', className)}
          {...props}
        >
          <SwitchRadix.Thumb className='DT_Switch_Thumb' />
        </SwitchRadix.Root>
      </div>
    )
  }
)
