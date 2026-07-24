import classNames from 'classnames'
import React, { FC } from 'react'
import { AI } from '@/shared/assets/images/icons'
import styles from './AiGenerator.module.scss'

interface Props {
  onClick: () => void
  className?: string
  disable?: boolean
}

export const AIGenerator: FC<Props> = ({
  onClick,
  className,
  disable = false
}) => {
  return (
    <button
      onClick={onClick}
      className={classNames(styles.button, className)}
      disabled={disable}
    >
      <AI className={styles.icon} />
    </button>
  )
}
