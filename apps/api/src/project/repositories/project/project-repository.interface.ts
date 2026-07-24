import { CustomQueryBuilder, RepositoryContract } from '@squareboat/nestjs-objection'
import { FetchGraphOptions, RelationExpression, TransactionOrKnex } from 'objection'
import { IProjectWithWorkspace, ProjectModel } from '../../models/project.model'
import { CreateProjectDto, ProjectSettingsDto } from '../../dto/project/in/create-project.dto'
import { WorkspaceModel } from '../../../workspace/models/workspace.model'
import { UserModel } from '../../../user/models/user.model'
import { WorkspaceUserModel } from '../../../workspace/models/workspace-user.model'
import { UpdateProjectDto } from '../../dto/project/in/update-project.dto'
import { ProjectExtraProperties } from '../../services/project/project.service'
import { ProjectPermissionsModel } from '../../models/project-permissions.model'
import { Knex } from '@mikro-orm/postgresql'
import { ProjectSettingsModel } from '../../models/project-settings.model'
import { ProjectRoleType } from '../../components/permissions/types/roles/project-role.interface'

export const PROJECT_REPOSITORY = 'project_repository'

export interface IProjectRepository extends RepositoryContract<ProjectModel> {
  query<R = ProjectModel>(): CustomQueryBuilder<ProjectModel, R>

  createProject(
    createProjectDto: CreateProjectDto,
    workspaceId: number,
    userId: number,
    slug: string,
    trx?: TransactionOrKnex
  ): Promise<ProjectModel>

  getProject(id: number): Promise<ProjectModel>

  getBySlugInWorkspace(workspaceId: number, slug: string): Promise<ProjectModel>

  getArchivedProject(id: number, trx?: TransactionOrKnex): Promise<ProjectModel>

  getProjectUserRole(projectId: number, id: number): Promise<ProjectRoleType | undefined>

  getWorkspaceAdmins(id: number, trx?: TransactionOrKnex): Promise<WorkspaceUserModel[]>

  updateProject(
    project: ProjectModel,
    updateProjectDto: UpdateProjectDto,
    trx?: TransactionOrKnex
  ): Promise<void>

  deleteProject(projectId: number, trx?: TransactionOrKnex): Promise<void>

  getProjectsByUser(user: UserModel, workspace: WorkspaceModel): Promise<ProjectModel[]>

  getArchivedProjectsByUser(
    user: UserModel,
    workspace: WorkspaceModel,
    fields: ProjectExtraProperties
  ): Promise<ProjectModel[]>

  getProjectByUser(id: number, workspace: WorkspaceModel, user: UserModel): Promise<ProjectModel>

  getArchivedProjectByUser(
    id: number,
    workspace: WorkspaceModel,
    user: UserModel
  ): Promise<ProjectModel>

  isSlugExists(slug: string): Promise<boolean>

  hasProjectAccess(
    user: UserModel,
    projectId: number,
    projectRole?: ProjectRoleType
  ): Promise<boolean>

  pathGuestAccessToProject(
    project: ProjectModel,
    userIdToGiveAccess: number,
    trx?: TransactionOrKnex
  ): Promise<ProjectPermissionsModel>

  removeUserFromProject(
    project: ProjectModel,
    userToRemove: UserModel,
    trx?: Knex.Transaction
  ): Promise<void>

  fetchGraph(
    project: ProjectModel,
    expression: RelationExpression<ProjectModel>,
    options?: FetchGraphOptions
  ): Promise<CustomQueryBuilder<ProjectModel, ProjectModel>>

  getMembers(project: ProjectModel, trx?: TransactionOrKnex): Promise<UserModel[]>

  getNumberOfMembers(project: IProjectWithWorkspace, trx?: TransactionOrKnex): Promise<number>

  getWorkspace(project: ProjectModel, trx?: TransactionOrKnex): Promise<WorkspaceModel>

  addProjectSettings(
    project: ProjectModel,
    settingsDto: ProjectSettingsDto,
    trx?: TransactionOrKnex
  ): Promise<ProjectSettingsModel>

  isTitleExists(title: string, workspaceId: number): Promise<boolean>

  getProjectsByWorkspace(workspace: WorkspaceModel): Promise<ProjectModel[]>
}
