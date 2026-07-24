import { AutoMap } from '@automapper/classes'
import { SprintStatuses } from '../../model/sprint.model'

export class ShortSprintDto {
  @AutoMap()
  id: number

  @AutoMap()
  status: SprintStatuses
}
