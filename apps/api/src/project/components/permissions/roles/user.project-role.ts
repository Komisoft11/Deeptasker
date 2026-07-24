import { PermissionsProjectRole } from './base.project-role'
import { ProjectRoleEnum, ProjectRoleType } from '../types/roles/project-role.interface'
import { ProjectUserPermissions } from '../types/roles/user-permissions.interface'

export class UserProjectRole extends PermissionsProjectRole {
  public static readonly role: ProjectRoleType = ProjectRoleEnum.user
  public static readonly defaultPermissions: ProjectUserPermissions = {
    openTasks: true,
    createTasks: true,
    createFolders: true,
    createTags: true,
    updateTags: true,
    deleteTags: true
  }

  constructor(permissions?: ProjectUserPermissions) {
    super(UserProjectRole.role, { ...UserProjectRole.defaultPermissions, ...permissions })
  }
}
