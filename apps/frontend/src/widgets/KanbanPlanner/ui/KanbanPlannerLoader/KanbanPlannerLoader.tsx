import React, { FC } from 'react'
import styles from '@/widgets/KanbanPlanner/KanbanPlanner.module.scss'
import { EmptyItem } from '@/shared/ui/Loading/EmptyItem'

export const KanbanPlannerLoader: FC = () => {
  const emptyContainers = new Array<null>(5).fill(null)

  return (
    <div
      style={{
        userSelect: 'none'
      }}
      className={styles.container}
    >
      {emptyContainers.map((_, index) => (
        <EmptyItem key={index} className={'w-[350px] h-[1146px]'} />
      ))}
    </div>
  )
}
