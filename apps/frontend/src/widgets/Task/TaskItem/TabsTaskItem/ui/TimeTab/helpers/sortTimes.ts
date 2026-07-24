import { TaskTimerHistoryResponse } from '@/entities/Task/model/types/task-response.interface'

export const sortTimes = (times: TaskTimerHistoryResponse[]) =>
  times.sort((a, b) => {
    const aTime = a.startTime ? new Date(a.startTime).getTime() : 0
    const bTime = b.startTime ? new Date(b.startTime).getTime() : 0
    return bTime - aTime
  })
