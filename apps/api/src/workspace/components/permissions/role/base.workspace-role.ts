import { IWorkspacePermissions } from '../types/workspace-permissions.interface'

interface IPermissionsWorkspaceRole {
  getPermissions(): IWorkspacePermissions
}

export class PermissionsWorkspaceRole implements IPermissionsWorkspaceRole {
  protected permissions: IWorkspacePermissions

  private static readonly default: IWorkspacePermissions = {
    createProjects: false,
    deleteProjects: false,
    editProjects: false,
    manageAdmins: false,
    edit: false,
    delete: false
  }

  constructor(permissions: Partial<IWorkspacePermissions>) {
    this.permissions = { ...PermissionsWorkspaceRole.default, ...permissions }
  }

  getPermissions(): IWorkspacePermissions {
    return this.permissions
  }
}
