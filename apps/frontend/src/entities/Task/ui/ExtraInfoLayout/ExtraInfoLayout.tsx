import { FC, ReactNode } from 'react'
import styles from './ExtraInfoLayout.module.scss'

interface Props {
  children: ReactNode
  isKanban?: boolean
}

export const ExtraInfoLayout: FC<Props> = ({ children, isKanban }) => {
  return (
    <div
      className={styles.subtask}
      style={{ padding: isKanban ? '4px' : undefined }}
    >
      {children}
    </div>
  )
}
