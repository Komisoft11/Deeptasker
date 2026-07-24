import { AutoMap } from '@automapper/classes'
import { UserShortDto } from '../../../common/dto/user-short.dto'

export class TaskCommentReactionResponse {
  @AutoMap()
  id: number

  @AutoMap()
  name: string

  @AutoMap()
  dateCreated: Date

  @AutoMap(() => UserShortDto)
  user: UserShortDto
}
