import { observer } from 'mobx-react-lite'
import React, { FC } from 'react'
import { TaskStatusSelect } from '@/widgets/Task'
import {
  Task,
  TaskStatusChanger,
  usePermissionTask,
  useTasks
} from '@/entities/Task'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'

interface Props {
  task: Task
  disabled?: boolean
  className?: string
}

export const TaskStatus: FC<Props> = observer(
  ({ task, disabled, className }) => {
    const statuses = task.project.statuses
    const currentStatus = task.status

    const { canChangeStatus } = usePermissionTask(task)

    const { taskStore, projectStore } = useRootStore()
    const { updateAsync } = useTasks()

    const changeTaskStatus = (newStatusId: string) => {
      const newStatus = projectStore.getStatusById(Number(newStatusId))

      const statusChanger = new TaskStatusChanger(task, taskStore)

      updateAsync.mutate(
        {
          id: task.id,
          dto: { statusId: newStatus.id }
        },
        {
          onSuccess: () => {
            statusChanger.change(newStatus)
          }
        }
      )
    }

    return (
      <TaskStatusSelect
        currentStatus={currentStatus}
        statuses={statuses}
        changeTaskStatus={changeTaskStatus}
        canChangeStatus={canChangeStatus}
        disabled={disabled}
        className={className}
      />
    )
  }
)
