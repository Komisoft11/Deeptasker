import { FC, useMemo } from 'react'
import styles from './CircleProgress.module.scss'

interface Props {
  completed: number
  total: number
}

export const CircleProgress: FC<Props> = ({ completed, total }) => {
  const radius = 6
  const circumference = 2 * Math.PI * radius

  const progress = useMemo(() => {
    const validTotal = total === 0 ? 1 : total
    const percentage = Math.min(Math.max(completed / validTotal, 0), 1)
    const dashOffset = circumference * (1 - percentage)

    const hue = percentage * 120

    return {
      dashOffset,
      color: `var(--accent)`,
      percentage: Math.round(percentage * 100)
    }
  }, [completed, total, circumference])

  return (
    <div className={styles.circleProgressContainer}>
      <svg width='16' height='16' viewBox='0 0 16 16'>
        <circle
          className={styles.progressBackground}
          cx='8'
          cy='8'
          r={radius}
        />
        <circle
          className={styles.progressBar}
          cx='8'
          cy='8'
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={progress.dashOffset}
          stroke={progress.color}
        />
      </svg>
    </div>
  )
}
