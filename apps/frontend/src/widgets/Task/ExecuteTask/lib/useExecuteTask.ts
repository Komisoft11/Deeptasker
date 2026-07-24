import React from 'react'
import { FinishTaskResponse, Task, TaskService } from '@/entities/Task'
import { useCreateMutation } from '@/entities/lib/useCreateMutation'
import { StatusCodes } from '@/shared/const/statusCodes'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'

interface IReturn {
  isExecuted: boolean
  handleFinishTask: (
    e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>
  ) => Promise<void>
}

export const useExecuteTask = (task: Task): IReturn => {
  const { taskStore, taskTimerStore } = useRootStore()

  const finishTaskAsync = useCreateMutation<FinishTaskResponse, unknown, Task>({
    mutationKey: ['execute task', task.id],
    mutationFn: TaskService.finish,
    onSuccess: (dto, task) => {
      taskStore.finish(dto, task)
    }
  })

  const processedTaskAsync = useCreateMutation<void, unknown, Task>({
    mutationKey: ['processed task', task.id],
    mutationFn: TaskService.backToWork,
    onSuccess: (_, variables) => {
      taskStore.processed(variables)
    }
  })

  const isExecuted = task.status.code === StatusCodes.EXECUTED

  const handleFinishTask = async (
    e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>
  ) => {
    e.preventDefault()
    e.stopPropagation()

    if (isExecuted) {
      await processedTaskAsync.mutateAsync(task)
    } else {
      if (taskTimerStore.isCurrentTaskRunning(task)) {
        taskTimerStore.stop(task, new Date())
      }
      await finishTaskAsync.mutateAsync(task)
    }
  }

  return {
    isExecuted,
    handleFinishTask
  }
}
