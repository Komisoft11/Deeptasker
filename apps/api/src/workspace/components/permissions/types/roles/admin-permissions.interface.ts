import { IWorkspacePermissions } from '../workspace-permissions.interface'

export type WorkspaceAdminPermissions = Pick<
  IWorkspacePermissions,
  'createProjects' | 'editProjects' | 'deleteProjects' | 'edit' | 'manageAdmins'
>
