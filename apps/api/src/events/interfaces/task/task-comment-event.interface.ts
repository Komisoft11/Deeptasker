import type { TaskCommentReactionModel as TaskModelReactionModelType } from '../../../task/comment/models/task-comment-reaction.model'
import { FileModel } from '../../../file/models/file.model'
import { IUser } from '../user.interface'

export type CommentEventType = 'add' | 'update' | 'delete'

export interface ITaskCommentEvent {
  type: CommentEventType
  taskId: number
  dto: {
    id: number
    replyId?: number
    user: IUser
    content?: string
    dateDeleted?: Date
    reaction?: {
      add?: TaskModelReactionModelType
      remove?: TaskModelReactionModelType
    }
    files?: FileModel[]
  }
}