import { PermissionsProjectRole } from './base.project-role'
import { ProjectRoleEnum, ProjectRoleType } from '../types/roles/project-role.interface'
import { ProjectGuestPermissions } from '../types/roles/guest-permissions.interface'

export class GuestProjectRole extends PermissionsProjectRole {
  public static readonly role: ProjectRoleType = ProjectRoleEnum.guest
  public static readonly defaultPermissions: ProjectGuestPermissions = {
    openTasks: true
  }

  constructor(permissions?: ProjectGuestPermissions) {
    super(GuestProjectRole.role, { ...GuestProjectRole.defaultPermissions, ...permissions })
  }
}
