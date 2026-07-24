import { AutoMap } from '@automapper/classes'
import { UserShortDto } from '../../../../common/dto/user-short.dto'
import { TaskStatusDto } from '../../../../common/dto/task-status.dto'
import { TagResponse } from '../../../../task/dto'
import { UserProjectDto } from './user-project.dto'
import { ProjectSettingsModel } from '../../../models/project-settings.model'

export class ProjectDto {
  @AutoMap()
  id: number

  @AutoMap()
  uuid: string

  @AutoMap()
  title: string

  @AutoMap()
  slug: string

  @AutoMap()
  parentId: number

  @AutoMap()
  rootId: number

  @AutoMap()
  order: number

  @AutoMap()
  taskCount: number

  @AutoMap()
  folderCount: number

  @AutoMap()
  iconBg: string

  @AutoMap()
  iconFg: string

  @AutoMap(() => UserShortDto)
  user?: UserShortDto

  @AutoMap(() => UserProjectDto)
  members?: UserProjectDto[]

  @AutoMap(() => TaskStatusDto)
  statuses?: TaskStatusDto[]

  @AutoMap(() => TagResponse)
  tags?: TagResponse[]

  @AutoMap(() => [ProjectSettingsModel])
  settings: ProjectSettingsModel

  @AutoMap()
  dateCreated: Date

  @AutoMap()
  dateArchived: Date
}
