import { useQuery, useQueryClient } from '@tanstack/react-query'
import { UseMutationResult } from '@tanstack/react-query/src/types'
import { timeHistoryQueries } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/TimeTab/api/timeHistoryQueries'
import { calculateTimeDifferenceInSeconds } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/TimeTab/helpers/calculateTimeDifference'
import {
  AddTimeHistoryRequest,
  Task,
  TaskService,
  TimerHistoryRequest
} from '@/entities/Task'
import { TaskTimerHistoryResponse } from '@/entities/Task/model/types/task-response.interface'
import { useCreateMutation } from '@/entities/lib/useCreateMutation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { showToast } from '@/shared/ui/ToastNotification/ToastNotification'

interface IReturn {
  timeHistory: TaskTimerHistoryResponse[]
  addTimeHistoryAsync: UseMutationResult<
    { id: number },
    unknown,
    AddTimeHistoryRequest
  >
  changeTimerHistoryAsync: UseMutationResult<
    void,
    unknown,
    {
      task: Task
      historyId: number
      timerUpdatedFields: TimerHistoryRequest
    }
  >
  deleteTimeHistoryAsync: UseMutationResult<
    void,
    unknown,
    TaskTimerHistoryResponse
  >
}

export const useTimeHistory = (task: Task): IReturn => {
  const { data: timeHistory } = useQuery({
    queryKey: timeHistoryQueries.history(task).queryKey,
    queryFn: timeHistoryQueries.history(task).queryFn,
    enabled: !!task
  })

  const { taskStore } = useRootStore()

  const qc = useQueryClient()

  const addTimeHistoryAsync = useCreateMutation<
    { id: number },
    unknown,
    AddTimeHistoryRequest
  >({
    mutationKey: ['add timer history'],
    mutationFn: ({ comment, startTime, endTime }) =>
      TaskService.addTimeHistory(task, { comment, startTime, endTime }),
    onSuccess: ({ id }, variables) => {
      const timeDifference: number =
        calculateTimeDifferenceInSeconds(
          variables.startTime,
          variables.endTime
        ) || 0

      task.userSecondsTracked += timeDifference

      showToast({
        title: 'Время успешно добавлено.',
        type: 'success'
      })

      qc.setQueryData<TaskTimerHistoryResponse[]>(
        timeHistoryQueries.history(task).queryKey,
        (oldData) => {
          const newHistory: TaskTimerHistoryResponse = {
            id: id,
            user: task.user,
            userId: task.user.id,
            taskId: task.id,
            editedDate: null,
            ...variables
          }
          return oldData ? [...oldData, newHistory] : [newHistory]
        }
      )
    },
    onError: () => {
      showToast({
        title: 'Ошибка при добавлении времени.',
        type: 'error'
      })
    }
  })

  const changeTimerHistoryAsync = useCreateMutation<
    void,
    unknown,
    {
      task: Task
      historyId: number
      timerUpdatedFields: TimerHistoryRequest
    }
  >({
    mutationKey: ['change timer history'],
    mutationFn: async ({ task, historyId, timerUpdatedFields }) => {
      await TaskService.changeTimerHistory(task, historyId, timerUpdatedFields)

      if (timerUpdatedFields.endTime) {
        const existingHistory = timeHistory?.find((h) => h.id === historyId)

        if (!existingHistory) {
          throw new Error('Timer history not found.')
        }

        const startTime = existingHistory.startTime
          ? new Date(existingHistory.startTime)
          : new Date(0)
        const endTime = existingHistory.endTime
          ? new Date(existingHistory.endTime)
          : new Date(0)

        const originalTimeDifference = calculateTimeDifferenceInSeconds(
          startTime,
          endTime
        )
        const updatedEndTime = timerUpdatedFields.endTime
          ? new Date(timerUpdatedFields.endTime)
          : new Date(0)
        const updatedTimeDifference = calculateTimeDifferenceInSeconds(
          startTime,
          updatedEndTime
        )

        task.userSecondsTracked =
          task.userSecondsTracked -
          originalTimeDifference +
          updatedTimeDifference
      }
    },
    onSuccess: async (_, variables) => {
      const { task, historyId, timerUpdatedFields } = variables

      qc.setQueryData<TaskTimerHistoryResponse[]>(
        timeHistoryQueries.history(task).queryKey,
        (oldData) => {
          if (!oldData) return oldData

          return oldData.map((item) => {
            if (item.id !== historyId) return item

            return {
              ...item,
              ...timerUpdatedFields,
              editedDate: new Date()
            }
          })
        }
      )

      showToast({
        title: variables.timerUpdatedFields.endTime
          ? 'Время окончания успешно изменено.'
          : 'Комментарий успешно изменён.',
        type: 'success'
      })
    },
    onError: (_, variables) => {
      showToast({
        title: variables.timerUpdatedFields.endTime
          ? 'Ошибка при изменении времени окончания..'
          : 'Ошибка при изменении комментария.',
        type: 'error'
      })
    }
  })

  const deleteTimeHistoryAsync = useCreateMutation<
    void,
    unknown,
    TaskTimerHistoryResponse
  >({
    mutationKey: ['delete time history'],
    mutationFn: TaskService.deleteTimeHistory,
    onSuccess: (_, dto) => {
      showToast({
        title: 'Время успешно удалено.',
        type: 'success'
      })

      taskStore.deleteTaskTimeHistory(dto)

      qc.setQueryData<TaskTimerHistoryResponse[]>(
        timeHistoryQueries.history(task).queryKey,
        (oldData) => {
          if (!oldData) return oldData

          return oldData.filter((item) => item.id !== dto.id)
        }
      )
    },
    onError: () => {
      showToast({
        title: 'Ошибка при удалении времени.',
        type: 'error'
      })
    }
  })

  return {
    timeHistory: timeHistory || [],
    addTimeHistoryAsync,
    changeTimerHistoryAsync,
    deleteTimeHistoryAsync
  }
}
