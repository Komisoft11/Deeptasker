import { AutoMap } from '@automapper/classes'
import { UserShortDto } from '../../../common/dto/user-short.dto'
import { TaskCommentReactionResponse } from './task-comment-reaction.dto'
import { UploadedFileResponse } from './uploaded-file.dto'

export class TaskCommentResponse {
  @AutoMap()
  id: number

  @AutoMap()
  content: string

  @AutoMap()
  replyId: number

  @AutoMap()
  dateCreated: Date

  @AutoMap()
  dateUpdated: Date

  @AutoMap(() => UserShortDto)
  user: UserShortDto

  @AutoMap(() => [TaskCommentReactionResponse])
  reactions: TaskCommentReactionResponse[]

  @AutoMap(() => [UploadedFileResponse])
  files: UploadedFileResponse[]
}
