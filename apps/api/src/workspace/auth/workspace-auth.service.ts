import { Injectable } from '@nestjs/common'
import { UserModel } from '../../user/models/user.model'
import { GlobalRole } from '../../user/access/enum.role'
import { WorkspaceUserModel } from '../models/workspace-user.model'
import { ICreatedRecord } from '../../common/interfaces/created-record.interface'
import { WorkspaceModel } from '../models/workspace.model'
import { ProjectPermissionsModel } from '../../project/models/project-permissions.model'
import { WorkspacePermissionsService } from '../services/permissions/workspace-permissions.service'

export interface IWorkspaceWithOwner extends ICreatedRecord {
  id: number
  userId: number
}

@Injectable()
export class WorkspaceAuthService {
  constructor(private readonly workspacePermissionsService: WorkspacePermissionsService) {}

  // TODO we are checking user plan for ws limit in Workspace Service, so maybe this method is not needed
  public async canCreate(user: UserModel): Promise<boolean> {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    return true
  }

  public async canCreateProjects(
    workspace: IWorkspaceWithOwner,
    user: UserModel
  ): Promise<boolean> {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    return await this.workspacePermissionsService.hasWorkspacePermissions(workspace.id, user.id, {
      createProjects: true
    })
  }

  public async canCreateTasks(workspaceId: number, user: UserModel): Promise<boolean> {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    return this.isOwnerOrAdmin(workspaceId, user.id)
  }

  public async canEditProjects(workspace: IWorkspaceWithOwner, user: UserModel): Promise<boolean> {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    return await this.workspacePermissionsService.hasWorkspacePermissions(workspace.id, user.id, {
      editProjects: true
    })
  }

  public async canDeleteProjects(workspaceId: number, user: UserModel): Promise<boolean> {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    return await this.workspacePermissionsService.hasWorkspacePermissions(workspaceId, user.id, {
      deleteProjects: true
    })
  }

  public async canRead(workspace: IWorkspaceWithOwner, user: UserModel): Promise<boolean> {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    return (
      this.isOwner(workspace, user) ||
      (await this.isAdmin(workspace, user)) ||
      (await this.isPartOfAnyWorkspaceProjects(workspace.id, user.id))
    )
  }

  async canDelete(workspace: IWorkspaceWithOwner, user: UserModel) {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    return this.isOwner(workspace, user)
  }

  public async canUpdate(workspace: IWorkspaceWithOwner, user: UserModel): Promise<boolean> {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    return await this.workspacePermissionsService.hasWorkspacePermissions(workspace.id, user.id, {
      edit: true
    })
  }

  public async canManageAdmins(workspace: IWorkspaceWithOwner, user: UserModel) {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    return await this.workspacePermissionsService.hasWorkspacePermissions(workspace.id, user.id, {
      manageAdmins: true
    })
  }

  public isOwner(workspace: IWorkspaceWithOwner, user: UserModel): boolean {
    return workspace.userId === user.id
  }

  public async isAdmin(workspace: ICreatedRecord, user: UserModel): Promise<boolean> {
    return WorkspaceUserModel.query()
      .where('workspaceId', workspace.id)
      .where('userId', user.id)
      .exists()
  }

  public async isOwnerOrAdmin(workspaceId: number, userId: number): Promise<boolean> {
    return WorkspaceModel.query()
      .alias('w')
      .leftJoin('workspace_user as wu', b => {
        b.on('wu.workspaceId', 'w.id').andOnVal('wu.userId', userId)
      })
      .where('w.id', workspaceId)
      .where(b => {
        b.where('w.userId', userId).orWhereNotNull('wu.userId')
      })
      .exists()
  }

  public async isPartOfAnyWorkspaceProjects(workspaceId: number, userId: number): Promise<boolean> {
    return ProjectPermissionsModel.query()
      .alias('pp')
      .innerJoin('project as p', 'p.id', 'pp.projectId')
      .where('p.workspaceId', workspaceId)
      .where('pp.userId', userId)
      .exists()
  }
}
