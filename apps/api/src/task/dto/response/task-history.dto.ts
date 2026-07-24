import { AutoMap } from '@automapper/classes'
import { UserShortDto } from '../../../common/dto/user-short.dto'

export class TaskHistoryResponse {
  @AutoMap()
  id: number

  @AutoMap()
  dateCreated: Date

  @AutoMap(() => UserShortDto)
  user: UserShortDto

  @AutoMap()
  field: string

  @AutoMap()
  oldValue: string

  @AutoMap()
  newValue: string
}
