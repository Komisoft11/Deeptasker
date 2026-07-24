import { IUser } from '../user.interface'
import { ITaskCommentEvent } from './task-comment-event.interface'
import { ITaskFileEvent } from './task-file.event.interface'
import { TagResponse } from '../../../task/dto'

export interface ITaskUpdateEvent {
  statusId?: number

  title?: string

  content?: string

  priority?: number

  dateCreated?: Date

  dateDeleted?: Date

  dateFinished?: Date

  activeDate?: Date

  finishedByTaskId?: number

  timerLastStartDate?: Date

  user?: IUser

  assigner?: IUser

  executor?: IUser

  observers?: {
    add?: IUser[]
    remove?: IUser[]
  }

  subtask?: number

  parent?: number

  comment?: ITaskCommentEvent

  file?: ITaskFileEvent

  customOrder?: number

  dateSentForReview?: Date

  tags?: {
    add?: TagResponse
    delete?: TagResponse
  }
}
