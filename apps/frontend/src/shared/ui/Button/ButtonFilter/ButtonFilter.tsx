import classNames from 'classnames'
import { ButtonHTMLAttributes, DetailedHTMLProps } from 'react'
import { Filter } from '@/shared/assets/images/icons'
import { Button } from '@/shared/ui/Button/Button'
import styles from './ButtonFilter.module.scss'

interface Props
  extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  isActive?: boolean
  isDirty?: boolean
}

export const ButtonFilter = ({
  isActive = false,
  isDirty = false,
  ...props
}: Props) => {
  return (
    <Button
      styleButton={'filled'}
      colorButton={'dark'}
      className={classNames(
        styles.button,
        (isActive || isDirty) && styles.active
      )}
      icon={
        <div className={styles.iconContainer}>
          <Filter
            className={classNames('w-5 h-5 icon', isActive && styles.active)}
          />
          {isDirty && <div className={styles.dot}></div>}
        </div>
      }
      {...props}
    />
  )
}
