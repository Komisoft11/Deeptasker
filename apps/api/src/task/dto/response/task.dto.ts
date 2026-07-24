import { AutoMap } from '@automapper/classes'
import { UserShortDto } from '../../../common/dto/user-short.dto'
import { TaskModel } from '../../models/task.model'
import { TagResponse } from './tag.dto'

export class TaskResponse {
  @AutoMap()
  id: number

  @AutoMap()
  title: string

  @AutoMap()
  content?: string

  @AutoMap()
  priority: number

  @AutoMap()
  statusId?: number

  @AutoMap()
  deadlineDate: Date

  @AutoMap()
  projectId: number

  @AutoMap()
  dateCreated: Date

  @AutoMap()
  dateFinished: Date

  @AutoMap()
  finishedByTaskId: number

  @AutoMap()
  activeDate: Date

  @AutoMap()
  customOrder: number

  @AutoMap()
  dateSentForReview: Date

  @AutoMap()
  estimatedTime: number

  @AutoMap()
  planStartDate: Date

  @AutoMap(() => UserShortDto)
  user: UserShortDto

  @AutoMap(() => UserShortDto)
  assigner: UserShortDto

  @AutoMap(() => UserShortDto)
  executor: UserShortDto

  @AutoMap()
  subtasks: number[]

  @AutoMap()
  parentId: number

  @AutoMap()
  folderId?: number

  @AutoMap(() => TaskModel)
  parent: TaskModel

  @AutoMap(() => [TagResponse])
  tags?: TagResponse[]

  @AutoMap()
  commentsCount: number

  @AutoMap()
  filesCount: number

  @AutoMap()
  statusDateUpdated: Date

  @AutoMap()
  sprintId: number

  @AutoMap()
  externalId: string
}
