import React, { FC } from 'react'
import TaskItemSkeleton from '@/entities/Task/ui/TaskListSkeleton/ui/TaskItemSkeleton'

interface Props {
  className?: string
  count?: number
}

export const TaskListSkeleton: FC<Props> = ({ className, count }) => {
  return (
    <>
      {Array.from({ length: count ?? 5 }).map((_, index) => (
        <TaskItemSkeleton key={index} className={className} />
      ))}
    </>
  )
}
