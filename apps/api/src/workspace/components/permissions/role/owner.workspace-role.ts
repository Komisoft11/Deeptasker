import { PermissionsWorkspaceRole } from './base.workspace-role'
import { WorkspaceOwnerPermissions } from '../types/roles/owner-permissions.interface'

export class OwnerWorkspaceRole extends PermissionsWorkspaceRole {
  private static readonly defaultPermissions: WorkspaceOwnerPermissions = {
    createProjects: true,
    deleteProjects: true,
    editProjects: true,
    manageAdmins: true,
    edit: true,
    delete: true
  }

  constructor() {
    super(OwnerWorkspaceRole.defaultPermissions)
  }
}
