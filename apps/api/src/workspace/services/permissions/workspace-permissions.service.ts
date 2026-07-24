import { Inject, Injectable } from '@nestjs/common'
import {
  IWorkspacePermissionsRepository,
  WORKSPACE_PERMISSIONS_REPOSITORY
} from '../../repositories/permissions/workspace-permissions-repository.interface'
import { IWorkspacePermissions } from 'src/workspace/components/permissions/types/workspace-permissions.interface'
import { UserModel } from '../../../user/models/user.model'
import { WorkspaceModel } from '../../models/workspace.model'
import { TransactionOrKnex } from 'objection'
import { OwnerWorkspaceRole } from '../../components/permissions/role/owner.workspace-role'
import { AdminWorkspaceRole } from '../../components/permissions/role/admin.workspace-role'
import { WorkspaceAdminPermissions } from '../../components/permissions/types/roles/admin-permissions.interface'

@Injectable()
export class WorkspacePermissionsService {
  constructor(
    @Inject(WORKSPACE_PERMISSIONS_REPOSITORY)
    private readonly workspacePermissionsRepository: IWorkspacePermissionsRepository
  ) {}

  public async getWorkspacePermissions(
    workspaceId: number,
    userId: number
  ): Promise<IWorkspacePermissions> {
    const permissionsWorkspaceRole =
      await this.workspacePermissionsRepository.getPermissionsWorkspaceRole(workspaceId, userId)

    return permissionsWorkspaceRole.getPermissions()
  }

  public async hasWorkspacePermissions(
    workspaceId: number,
    userId: number,
    permissions: Partial<IWorkspacePermissions>
  ): Promise<boolean> {
    if (Object.keys(permissions).length === 0) {
      throw new Error('No permissions provided for checking')
    }

    return this.workspacePermissionsRepository.hasWorkspacePermissions(
      workspaceId,
      userId,
      permissions
    )
  }

  public async giveOwnerPermissionsToWorkspace(
    admin: UserModel,
    workspace: WorkspaceModel,
    trx?: TransactionOrKnex
  ) {
    return this.workspacePermissionsRepository.givePermissionsToWorkspaceRole(
      workspace.id,
      admin.id,
      new OwnerWorkspaceRole(),
      trx
    )
  }

  public async giveAdminPermissionsToWorkspace(
    admin: UserModel,
    workspace: WorkspaceModel,
    trx?: TransactionOrKnex
  ) {
    return this.workspacePermissionsRepository.givePermissionsToWorkspaceRole(
      workspace.id,
      admin.id,
      new AdminWorkspaceRole(),
      trx
    )
  }

  public async updateAdminPermissionsToWorkspace(
    admin: UserModel,
    workspace: WorkspaceModel,
    permissions: WorkspaceAdminPermissions,
    trx?: TransactionOrKnex
  ) {
    return this.workspacePermissionsRepository.updatePermissionsToWorkspaceRole(
      workspace.id,
      admin.id,
      new AdminWorkspaceRole(permissions),
      trx
    )
  }

  public async removeAdminPermissionsToWorkspace(
    user: UserModel,
    workspace: WorkspaceModel,
    trx: TransactionOrKnex
  ): Promise<void> {
    return this.workspacePermissionsRepository.removeAdminPermissionsToWorkspace(
      user,
      workspace,
      trx
    )
  }
}
