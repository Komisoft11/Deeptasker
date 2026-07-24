import { createQueryKeys } from '@lukemorales/query-key-factory'
import { Task, TaskService } from '@/entities/Task'

export const timeHistoryQueries = createQueryKeys('timeHistory', {
  history: (task: Task) => ({
    queryKey: ['time history', task.id],
    queryFn: () => TaskService.getTimeHistory(task)
  })
})
