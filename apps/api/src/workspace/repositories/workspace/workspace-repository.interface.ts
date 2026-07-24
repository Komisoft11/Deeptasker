import { CustomQueryBuilder, RepositoryContract } from '@squareboat/nestjs-objection'
import { WorkspaceModel } from '../../models/workspace.model'
import { CreateWorkspaceDto } from '../../dto/in/create-workspace.dto'
import { UserModel } from '../../../user/models/user.model'
import { FetchGraphOptions, RelationExpression, TransactionOrKnex } from 'objection'
import { UpdateWorkspaceDto } from '../../dto/in/update-workspace.dto'
import { ProjectModel } from '../../../project/models/project.model'

export const WORKSPACE_REPOSITORY = 'workspace_repository'

export interface IWorkspaceRepository extends RepositoryContract<WorkspaceModel> {
  query<R = WorkspaceModel>(): CustomQueryBuilder<WorkspaceModel, R>

  createWorkspace(
    createWorkspaceDto: CreateWorkspaceDto,
    user: UserModel,
    trx?: TransactionOrKnex
  ): Promise<WorkspaceModel>

  getWorkspace(id: number): Promise<WorkspaceModel>

  updateWorkspace(workspace: WorkspaceModel, updateWorkspaceDto: UpdateWorkspaceDto): Promise<void>

  deleteWorkspace(workspace: WorkspaceModel, trx?: TransactionOrKnex): Promise<void>

  getUserWorkspaces(user: UserModel): Promise<WorkspaceModel[]>

  fetchGraph(
    workspace: WorkspaceModel,
    expression: RelationExpression<WorkspaceModel>,
    options?: FetchGraphOptions
  ): Promise<CustomQueryBuilder<WorkspaceModel, WorkspaceModel>>

  createWorkspaceUser(userId: number, workspaceId: number, trx?: TransactionOrKnex): Promise<void>

  removeWorkspaceUser(userId: number, workspaceId: number, trx?: TransactionOrKnex): Promise<void>

  getProjects(workspace: WorkspaceModel, trx?: TransactionOrKnex): Promise<ProjectModel[]>

  getAdmins(workspaceId: number, trx?: TransactionOrKnex): Promise<UserModel[]>

  getOwnerAndAdmins(workspaceId: number, trx?: TransactionOrKnex): Promise<UserModel[]>
}
