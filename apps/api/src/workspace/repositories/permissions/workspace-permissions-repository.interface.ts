import { CustomQueryBuilder, RepositoryContract } from '@squareboat/nestjs-objection'
import { WorkspacePermissionsModel } from '../../models/workspace-permissions.model'
import { IWorkspacePermissions } from '../../components/permissions/types/workspace-permissions.interface'
import { TransactionOrKnex } from 'objection'
import { PermissionsWorkspaceRole } from '../../components/permissions/role/base.workspace-role'
import { UserModel } from '../../../user/models/user.model'
import { WorkspaceModel } from '../../models/workspace.model'

export const WORKSPACE_PERMISSIONS_REPOSITORY = 'workspace_permissions_repository'

export interface IWorkspacePermissionsRepository
  extends RepositoryContract<WorkspacePermissionsModel> {
  query<R = WorkspacePermissionsModel>(): CustomQueryBuilder<WorkspacePermissionsModel, R>

  getPermissionsWorkspaceRole(
    workspaceId: number,
    userId: number
  ): Promise<PermissionsWorkspaceRole>

  hasWorkspacePermissions(
    workspaceId: number,
    userId: number,
    permissions: Partial<IWorkspacePermissions>
  ): Promise<boolean>

  givePermissionsToWorkspaceRole(
    workspaceId: number,
    userId: number,
    permissionsWorkspaceRole: PermissionsWorkspaceRole,
    trx?: TransactionOrKnex
  ): Promise<void>

  updatePermissionsToWorkspaceRole(
    workspaceId: number,
    userId: number,
    permissionsWorkspaceRole: PermissionsWorkspaceRole,
    trx?: TransactionOrKnex
  ): Promise<void>

  removeAdminPermissionsToWorkspace(
    user: UserModel,
    workspace: WorkspaceModel,
    trx: TransactionOrKnex
  ): Promise<void>
}
