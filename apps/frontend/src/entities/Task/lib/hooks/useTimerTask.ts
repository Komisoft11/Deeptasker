import { UseMutationResult } from '@tanstack/react-query/src/types'
import { useTranslation } from 'react-i18next'
import {
  StartTaskResponse,
  StopTaskResponse,
  Task,
  TaskService
} from '@/entities/Task'
import { useCreateMutation } from '@/entities/lib/useCreateMutation'
import { SUCCESS } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { showToast } from '@/shared/ui/ToastNotification/ToastNotification'

interface IReturn {
  startTimerAsync: UseMutationResult<StartTaskResponse, unknown, Task>
  stopTimerAsync: UseMutationResult<StopTaskResponse, unknown, Task>
}

export const useTimerTask = (): IReturn => {
  const { taskTimerStore, taskStore } = useRootStore()
  const { t } = useTranslation([SUCCESS])

  const startTimerAsync = useCreateMutation<StartTaskResponse, unknown, Task>({
    mutationKey: ['timer start'],
    mutationFn: async (task) => {
      const isOtherTaskRunning = taskTimerStore.isOtherTaskRunning(task)

      if (isOtherTaskRunning) {
        await stopTimerAsync.mutateAsync(taskStore.trackingTask)
      }

      return TaskService.startTimer(task)
    },
    onSuccess: (dto, task) => {
      taskTimerStore.start(task, dto.startedAt)

      showToast({
        title: t('tracker.startTrackingTitle', { ns: SUCCESS }),
        text: t('tracker.startTrackingText', {
          ns: SUCCESS,
          title: task.title
        }) as string,
        type: 'success'
      })
    }
  })

  const stopTimerAsync = useCreateMutation<StopTaskResponse, unknown, Task>({
    mutationKey: ['timer stop'],
    mutationFn: TaskService.stopTimer,
    onSuccess: (dto, task) => {
      taskTimerStore.stop(task, dto.stoppedAt)

      showToast({
        title: t('tracker.stopTrackingTitle', { ns: SUCCESS }),
        text: t('tracker.stopTrackingText', {
          ns: SUCCESS,
          title: task.title
        }) as string,
        type: 'success'
      })
    }
  })

  return {
    startTimerAsync,
    stopTimerAsync
  }
}
