import { createQueryKeys } from '@lukemorales/query-key-factory'
import { Task } from '@/entities/Task'
import { TaskCommentService } from '@/entities/TaskComment/services/task.comment.service'

export const commentQueries = createQueryKeys('comments', {
  comments: (task: Task) => ({
    queryKey: ['comments', task.id],
    queryFn: () => TaskCommentService.getComments(task)
  })
})
