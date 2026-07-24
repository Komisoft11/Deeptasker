import classNames from 'classnames'
import React, { FC, useMemo } from 'react'
import { Task } from '@/entities/Task'
import styles from './TaskContent.module.scss'


interface Props {
  task: Task
  className?: string
  isTaskPage?: boolean
}

export const TaskContent: FC<Props> = ({
  task,
  className,
  isTaskPage = false
}) => {
  const taskCommentContent = useMemo(() => {
    if (!task.content) return ''

    const regex = /<[^>]*>/g
    let content = task.content.replace(regex, ' ')

    if (content.length > 150) {
      if (isTaskPage) {
        content = content.slice(0, 300)
      } else {
        content = content.slice(0, 150)
      }
    }

    return content
  }, [task.content])

  return (
    <p className={classNames(styles.taskCommentContent, className)}>
      {taskCommentContent}
    </p>
  )
}
