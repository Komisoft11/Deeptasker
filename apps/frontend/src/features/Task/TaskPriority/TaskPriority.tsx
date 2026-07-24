import { observer } from 'mobx-react-lite'
import React from 'react'
import { TaskPrioritySelect } from '@/widgets/Task'
import { Task, usePermissionTask, useTasks } from '@/entities/Task'
import { findPriority } from '@/entities/Task/services/task-priorities'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'


type Mode = 'regular' | 'minimum' | 'kanban'

interface Props {
  task: Task
  disabled: boolean
  mode?: Mode
}

export const TaskPriority = observer(
  ({ task, disabled, mode = 'regular' }: Props) => {
    const { themeModeStore } = useRootStore()

    const { canChangePriority } = usePermissionTask(task)

    const { updateAsync } = useTasks()

    const currentPriority = findPriority(task.priority, themeModeStore.mode)

    const changeSelectedPriority = async (selectedPriorityId: string) => {
      return updateAsync.mutateAsync(
        {
          id: task.id,
          dto: { priority: Number(selectedPriorityId) }
        },
        {
          onSuccess: () => {
            task.priority = Number(selectedPriorityId)
          }
        }
      )
    }

    return (
      <TaskPrioritySelect
        currentPriority={currentPriority}
        changeSelectedPriority={changeSelectedPriority}
        mode={mode}
        disabled={disabled}
        canChangePriority={canChangePriority}
      />
    )
  }
)
