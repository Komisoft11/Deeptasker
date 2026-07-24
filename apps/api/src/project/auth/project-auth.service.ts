import { Injectable } from '@nestjs/common'
import { UserModel } from '../../user/models/user.model'
import { ProjectModel } from '../models/project.model'
import { GlobalRole } from '../../user/access/enum.role'
import { WorkspaceAuthService } from '../../workspace/auth/workspace-auth.service'
import { ICreatedRecord } from '../../common/interfaces/created-record.interface'
import { WorkspaceModel } from '../../workspace/models/workspace.model'
import { ProjectPermissionsModel } from '../models/project-permissions.model'
import { UpdateTaskRequest } from '../../task/dto'
import { ProjectPermissionsService } from '../services/project-permissions/project-permissions.service'
import { WorkspacePermissionsService } from '../../workspace/services/permissions/workspace-permissions.service'
import {
  ProjectRoleEnum,
  ProjectRoleType
} from '../components/permissions/types/roles/project-role.interface'
import { IProjectPermissions } from '../components/permissions/types/project-permissions.interface'

@Injectable()
export class ProjectAuthService {
  constructor(
    private readonly workspaceAuthService: WorkspaceAuthService,
    private readonly workspacePermissionsService: WorkspacePermissionsService,
    private readonly projectPermissionsService: ProjectPermissionsService
  ) {}

  public async canCreateTasks(user: UserModel, project: ProjectModel): Promise<boolean> {
    return this.hasProjectPermissionOrIsOwner(user, project, { createTasks: true })
  }

  public async canCreateFolders(project: ProjectModel, user: UserModel) {
    return this.hasProjectPermissionOrIsOwner(user, project, { createFolders: true })
  }

  public async canEditFolders(project: ProjectModel, user: UserModel) {
    return this.hasProjectPermissionOrIsOwner(user, project, { editFolders: true })
  }

  public async canDeleteFolders(project: ProjectModel, user: UserModel) {
    return this.hasProjectPermissionOrIsOwner(user, project, { deleteFolders: true })
  }

  private async hasProjectPermissionOrIsOwner(
    user: UserModel,
    project: ProjectModel,
    permission: Partial<IProjectPermissions>
  ): Promise<boolean> {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    return (
      this.isOwner(user, project) ||
      (await this.projectPermissionsService.hasProjectPermissions(project.id, user.id, permission))
    )
  }

  private async isOwnerOrInProjectUserList(user: UserModel, projectId: number): Promise<boolean> {
    return await ProjectModel.query()
      .alias('p')
      .leftJoin('project_permissions as pp', builder => {
        builder.on('pp.projectId', 'p.id').andOnVal('pp.userId', user.id)
      })
      .where('p.id', projectId)
      .where(builder => {
        builder.where('p.userId', user.id).orWhereNotNull('pp.userId')
      })
      .exists()
  }

  public async canRead(user: UserModel, project: ProjectModel): Promise<boolean> {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    return (
      this.isOwner(user, project) ||
      (await this.workspaceAuthService.isOwnerOrAdmin(project.workspaceId, user.id)) ||
      (await this.isOwnerOrInProjectUserList(user, project.id))
    )
  }

  public async canUpdate(user: UserModel, project: ProjectModel): Promise<boolean> {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    return (
      this.isOwner(user, project) ||
      (await this.projectPermissionsService.hasProjectPermissions(project.id, user.id, {
        edit: true
      })) ||
      (await this.workspacePermissionsService.hasWorkspacePermissions(
        project.workspaceId,
        user.id,
        { editProjects: true }
      ))
    )
  }

  public async canDelete(user: UserModel, project: ProjectModel): Promise<boolean> {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    return (
      this.isOwner(user, project) ||
      (await this.workspaceAuthService.canDeleteProjects(project.workspaceId, user))
    )
  }

  public async canCreateProjects(workspace: WorkspaceModel, user: UserModel): Promise<boolean> {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    return this.workspaceAuthService.canCreateProjects(workspace, user)
  }

  public async canAddUser(user: UserModel, project: ProjectModel): Promise<boolean> {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    return (
      this.isOwner(user, project) ||
      (await this.projectPermissionsService.hasProjectPermissions(project.id, user.id, {
        addUsers: true
      }))
    )
  }

  public async canRemoveUser(user: UserModel, project: ProjectModel): Promise<boolean> {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    return (
      this.isOwner(user, project) ||
      (await this.projectPermissionsService.hasProjectPermissions(project.id, user.id, {
        removeUsers: true
      }))
    )
  }

  public async canCreateStatus(user: UserModel, project: ProjectModel): Promise<boolean> {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    return (
      this.isOwner(user, project) ||
      (await this.isAdmin(user, project)) ||
      (await this.workspaceAuthService.isOwnerOrAdmin(project.workspaceId, user.id))
    )
  }

  public async canDeleteStatus(user: UserModel, project: ProjectModel): Promise<boolean> {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    return (
      this.isOwner(user, project) ||
      (await this.isAdmin(user, project)) ||
      (await this.workspaceAuthService.isOwnerOrAdmin(project.workspaceId, user.id))
    )
  }

  public async isAdmin(user: UserModel, project: ICreatedRecord): Promise<boolean> {
    return ProjectPermissionsModel.query()
      .where('projectId', project.id)
      .where('userId', user.id)
      .where('role', ProjectRoleEnum.admin)
      .exists()
  }

  public async canMoveTasks(user: UserModel, project: ICreatedRecord): Promise<boolean> {
    return await this.projectPermissionsService.hasProjectPermissions(project.id, user.id, {
      moveTasks: true
    })
  }

  public isOwner(user: UserModel, project: ProjectModel): boolean {
    return project.userId === user.id
  }

  public async canDeleteComments(user: UserModel, projectId: number): Promise<boolean> {
    return this.projectPermissionsService.hasProjectPermissions(projectId, user.id, {
      deleteTaskComments: true
    })
  }

  public async canDeleteTaskFile(user: UserModel, projectId: number): Promise<boolean> {
    return this.projectPermissionsService.hasProjectPermissions(projectId, user.id, {
      deleteTaskFile: true
    })
  }

  public async hasProjectRole(
    user: UserModel,
    projectId: number,
    role: ProjectRoleType
  ): Promise<boolean> {
    return ProjectPermissionsModel.query()
      .where('role', role)
      .andWhere('userId', user.id)
      .andWhere('projectId', projectId)
      .exists()
  }

  public async canManageAdmins(user: UserModel, project: ProjectModel): Promise<boolean> {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    return (
      this.isOwner(user, project) ||
      (await this.projectPermissionsService.hasProjectPermissions(project.id, user.id, {
        manageAdmins: true
      }))
    )
  }

  public async canDeleteTasks(user: UserModel, project: ICreatedRecord): Promise<boolean> {
    return this.projectPermissionsService.hasProjectPermissions(project.id, user.id, {
      deleteTasks: true
    })
  }

  public async canFinishTasks(user: UserModel, projectId: number): Promise<boolean> {
    return this.projectPermissionsService.hasProjectPermissions(projectId, user.id, {
      executeTask: true
    })
  }

  public async canAssignTasks(user: UserModel, projectId: number): Promise<boolean> {
    return this.projectPermissionsService.hasProjectPermissions(projectId, user.id, {
      changeTaskExecutor: true
    })
  }

  public async canManageTaskObservers(user: UserModel, projectId: number): Promise<boolean> {
    return this.projectPermissionsService.hasProjectPermissions(projectId, user.id, {
      manageTaskObservers: true
    })
  }

  public async canUpdateTaskInfo(
    user: UserModel,
    projectId: number,
    updateTaskDto: UpdateTaskRequest
  ): Promise<boolean> {
    const checkInfoPermission = async (
      property: any | any[],
      permissions: Partial<IProjectPermissions>
    ): Promise<boolean> => {
      let needToCheck = false

      if (Array.isArray(property)) {
        for (const p of property) {
          if (p) {
            needToCheck = true
            break
          }
        }
      } else {
        if (property) needToCheck = true
      }

      if (!needToCheck) {
        return true
      }

      return this.projectPermissionsService.hasProjectPermissions(projectId, user.id, permissions)
    }

    const results = await Promise.all([
      checkInfoPermission(updateTaskDto.title, { editTaskTitle: true }),
      checkInfoPermission(updateTaskDto.content, { editTaskDescription: true }),
      checkInfoPermission(updateTaskDto.deadlineDate, { editTaskDeadline: true }),
      checkInfoPermission(updateTaskDto.priority, { editTaskPriority: true }),
      checkInfoPermission([updateTaskDto.statusId, updateTaskDto.statusOrder], {
        editTaskStatus: true
      })
    ])

    for (const result of results) {
      if (!result) return false
    }

    return true
  }

  public async canConfirmTaskExecution(user: UserModel, projectId: number): Promise<boolean> {
    return this.projectPermissionsService.hasProjectPermissions(projectId, user.id, {
      confirmExecuteTask: true
    })
  }

  public async canEditTaskTracking(user: UserModel, projectId: number): Promise<boolean> {
    return this.projectPermissionsService.hasProjectPermissions(projectId, user.id, {
      editTaskTracking: true
    })
  }

  public async isGuest(user: UserModel, projectId: number): Promise<boolean> {
    return this.hasProjectRole(user, projectId, 'guest')
  }

  public async canGenerateReports(user: UserModel, projectId: number): Promise<boolean> {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    return this.projectPermissionsService.hasProjectPermissions(projectId, user.id, {
      generateReports: true
    })
  }

  public async canListReports(user: UserModel, projectId: number): Promise<boolean> {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    // TODO: There is no permission to display reports. Set as generateReports permission
    return this.projectPermissionsService.hasProjectPermissions(projectId, user.id, {
      listReports: true
    })
  }

  public async canDeleteReports(user: UserModel, projectId: number): Promise<boolean> {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    // TODO: There is no permission to delete reports. Set as generateReports permission
    return this.projectPermissionsService.hasProjectPermissions(projectId, user.id, {
      deleteReports: true
    })
  }

  public async canCreateSprints(project: ProjectModel, user: UserModel) {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    return this.hasProjectPermissionOrIsOwner(user, project, { createSprints: true })
  }

  public async canUpdateSprints(project: ProjectModel, user: UserModel) {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    return this.hasProjectPermissionOrIsOwner(user, project, { updateSprints: true })
  }

  public async canDeleteSprints(project: ProjectModel, user: UserModel): Promise<boolean> {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    return this.hasProjectPermissionOrIsOwner(user, project, { deleteSprints: true })
  }
}
