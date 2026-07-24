import { Injectable } from '@nestjs/common'
import { Repository } from '../../../common/database/repository'
import { InjectModel } from '@squareboat/nestjs-objection'
import { WorkspacePermissionsModel } from '../../models/workspace-permissions.model'
import { IWorkspacePermissionsRepository } from './workspace-permissions-repository.interface'
import { IWorkspacePermissions } from '../../components/permissions/types/workspace-permissions.interface'
import { TransactionOrKnex } from 'objection'
import { DataBaseException } from '../../../exceptions/DataBaseException'
import { PermissionsWorkspaceRole } from '../../components/permissions/role/base.workspace-role'
import { UserModel } from '../../../user/models/user.model'
import { WorkspaceModel } from '../../models/workspace.model'

@Injectable()
export class WorkspacePermissionsRepository
  extends Repository<WorkspacePermissionsModel>
  implements IWorkspacePermissionsRepository
{
  @InjectModel(WorkspacePermissionsModel)
  model: WorkspacePermissionsModel

  public async getPermissionsWorkspaceRole(
    workspaceId: number,
    userId: number
  ): Promise<PermissionsWorkspaceRole> {
    const workspacePermissionsModel = await WorkspacePermissionsModel.query()
      .where('workspaceId', workspaceId)
      .where('userId', userId)
      .first()

    return new PermissionsWorkspaceRole({
      createProjects: workspacePermissionsModel?.createProjects,
      deleteProjects: workspacePermissionsModel?.deleteProjects,
      editProjects: workspacePermissionsModel?.editProjects,
      manageAdmins: workspacePermissionsModel?.manageAdmins,
      edit: workspacePermissionsModel?.edit,
      delete: workspacePermissionsModel?.delete
    })
  }

  public async hasWorkspacePermissions(
    workspaceId: number,
    userId: number,
    permissions: Partial<IWorkspacePermissions>
  ): Promise<boolean> {
    const permissionsExpressions = Object.keys(permissions).reduce(
      (expr, permission) => ({ ...expr, [permission]: permissions[permission] }),
      {}
    )

    return WorkspacePermissionsModel.query()
      .where('workspaceId', workspaceId)
      .andWhere('userId', userId)
      .andWhere(permissionsExpressions)
      .exists()
  }

  public async givePermissionsToWorkspaceRole(
    workspaceId: number,
    userId: number,
    permissionsWorkspaceRole: PermissionsWorkspaceRole,
    trx?: TransactionOrKnex
  ): Promise<void> {
    try {
      const permissions = permissionsWorkspaceRole.getPermissions()

      await WorkspacePermissionsModel.query(trx).insert({
        workspaceId: workspaceId,
        userId: userId,
        createProjects: permissions.createProjects,
        deleteProjects: permissions.deleteProjects,
        editProjects: permissions.editProjects,
        manageAdmins: permissions.manageAdmins,
        edit: permissions.edit,
        delete: permissions.delete
      })
    } catch (e) {
      throw new DataBaseException(e)
    }
  }

  public async updatePermissionsToWorkspaceRole(
    workspaceId: number,
    userId: number,
    permissionsWorkspaceRole: PermissionsWorkspaceRole,
    trx?: TransactionOrKnex
  ): Promise<void> {
    try {
      const permissions = permissionsWorkspaceRole.getPermissions()

      await WorkspacePermissionsModel.query(trx)
        .findOne({
          workspaceId: workspaceId,
          userId: userId
        })
        .patch({
          createProjects: permissions.createProjects,
          deleteProjects: permissions.deleteProjects,
          editProjects: permissions.editProjects,
          manageAdmins: permissions.manageAdmins,
          edit: permissions.edit,
          delete: permissions.delete
        })
    } catch (e) {
      throw new DataBaseException(e)
    }
  }

  public async removeAdminPermissionsToWorkspace(
    user: UserModel,
    workspace: WorkspaceModel,
    trx: TransactionOrKnex
  ): Promise<void> {
    try {
      await WorkspacePermissionsModel.query(trx)
        .delete()
        .where('workspaceId', workspace.id)
        .where('userId', user.id)
    } catch (e) {
      throw new DataBaseException(e)
    }
  }
}
