import { WorkspaceModel } from '../../../../workspace/models/workspace.model'
import { ProjectExtraProperties } from '../project.service'
import { UserModel } from '../../../../user/models/user.model'
import { ProjectModel } from '../../../models/project.model'
import { TaskResponse } from '../../../../task/dto'
import { TaskFilterDto } from '../../../dto/project/in/task-filter.dto'
import { ProjectDto } from '../../../dto/project/out/project.dto'

export interface IProjectService {
  getSingleProjectByUser(
    id: number,
    workspace: WorkspaceModel,
    user: UserModel
  ): Promise<ProjectDto>

  getProjectsByUser(
    user: UserModel,
    workspace: WorkspaceModel,
    fields: ProjectExtraProperties,
    isArchived?: boolean
  ): Promise<ProjectDto[]>

  getProjectTasks(
    project: ProjectModel,
    user: UserModel,
    filter?: TaskFilterDto
  ): Promise<TaskResponse[]>

  get(id: number): Promise<ProjectModel>
}
