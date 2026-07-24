import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React from 'react'
import {
  TaskActionsColumn,
  TaskExecutorAutocomplete,
  TaskNameColumn,
  TaskPriorityColumn,
  TaskStatusColumn
} from '@/features/Task'
import { DeadlineDate } from '@/features/Task/DeadlineDate/DeadlineDate'
import { ExternalId, Task } from '@/entities/Task'
import styles from './TaskItem.module.scss'

interface Props {
  task: Task
  className?: string
}

export const TaskItem = observer(({ task, className }: Props) => {
  return (
    <div className={classNames(styles.item, className)}>
      <div className={styles.title}>
        <TaskNameColumn task={task} />
      </div>
      <ExternalId externalId={task.externalId} />
      <div>
        <TaskPriorityColumn task={task} disabled />
      </div>
      <div className={'max-w-[200px] w-full'}>
        <TaskExecutorAutocomplete task={task} className={'w-full'} disabled />
      </div>
      <div>
        <DeadlineDate task={task} rootClassName={'w-full'} disabled />
      </div>
      <div>
        <TaskStatusColumn task={task} disabled />
      </div>
      <div className={styles.actions}>
        <TaskActionsColumn task={task} disabled />
      </div>
    </div>
  )
})
