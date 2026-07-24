import { AutoMap } from '@automapper/classes'
import { SprintStatuses } from '../../model/sprint.model'
import { UserShortDto } from '../../../common/dto/user-short.dto'

export class SprintDto {
  @AutoMap()
  id!: number

  @AutoMap()
  title: string

  @AutoMap()
  description?: string

  @AutoMap(() => UserShortDto)
  user: UserShortDto

  @AutoMap()
  projectId!: number

  @AutoMap()
  status!: SprintStatuses

  @AutoMap()
  dateCreated: Date

  @AutoMap()
  dateStart: Date

  @AutoMap()
  dateEnd: Date

  @AutoMap()
  taskIds: number[]
}
