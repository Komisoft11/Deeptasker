import { AutoMap } from '@automapper/classes'
import { TaskStatusDto } from '../../../common/dto/task-status.dto'

export class TaskShortResponse {
  @AutoMap()
  id: number

  @AutoMap()
  title: string

  @AutoMap()
  priority: number

  @AutoMap()
  deadlineDate: Date

  @AutoMap()
  projectId: number

  @AutoMap()
  dateCreated: Date

  @AutoMap()
  activeDate: Date

  userSecondsTracked: number

  @AutoMap(() => [TaskStatusDto])
  status?: TaskStatusDto
}
