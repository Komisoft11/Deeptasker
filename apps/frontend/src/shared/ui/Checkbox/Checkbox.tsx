import {
  Indicator,
  CheckboxProps as RadixCheckboxProps,
  Root
} from '@radix-ui/react-checkbox'
import classNames from 'classnames'
import { ReactNode, forwardRef, useId } from 'react'
import { Check } from '@/shared/assets/images/icons'
import styles from './Checkbox.module.scss'

interface Props extends RadixCheckboxProps {
  label?: ReactNode
  classNameLabel?: string
  containerClassName?: string
}

export const Checkbox = forwardRef<HTMLButtonElement, Props>(
  ({ label, classNameLabel = '', containerClassName, ...props }, ref) => {
    const id = useId()

    return (
      <div className={classNames(styles.checkbox, containerClassName)}>
        <Root id={id} {...props} ref={ref}>
          <Indicator className={classNames('CheckboxIndicator', styles.icon)}>
            <Check />
          </Indicator>
        </Root>
        {label && (
          <label htmlFor={id} className={classNameLabel}>
            {label}
          </label>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'
