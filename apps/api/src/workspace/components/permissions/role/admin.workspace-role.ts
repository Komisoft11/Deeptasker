import { PermissionsWorkspaceRole } from './base.workspace-role'
import { WorkspaceAdminPermissions } from '../types/roles/admin-permissions.interface'

export class AdminWorkspaceRole extends PermissionsWorkspaceRole {
  private static readonly defaultPermissions: WorkspaceAdminPermissions = {
    createProjects: true,
    deleteProjects: true,
    editProjects: true,
    manageAdmins: true,
    edit: true
  }

  constructor(permissions?: WorkspaceAdminPermissions) {
    super({ ...AdminWorkspaceRole.defaultPermissions, ...permissions })
  }
}
