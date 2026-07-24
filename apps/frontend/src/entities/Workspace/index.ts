// UI
export { useWorkspaces } from './lib/hooks/useWorkspaces'
export { WorkspaceEmpty } from './ui/WorkspaceEmpty/WorkspaceEmpty'
export { WorkspaceCard } from './ui/WorkspaceCard/WorkspaceCard'

export type {
  ICreatedWorkspaceDTO,
  IWorkspaceDTO,
  IPermissionWorkspace,
  IWorkspaceUpdateDto,
  IWorkspaceCreateDto,
  IWorkspaceUpdateByFieldsDto,
  IWorkspaceInviteAdminDTO,
  IWorkspaceRemoveMemberDTO
} from './model/types/workspace.interface'

export { WorkspaceStore } from './model/workspace.store'
export { Workspace } from './model/workspace'

// SCHEMAS
export { workspaceSettingsSchema } from './lib/workspaceSchema'
