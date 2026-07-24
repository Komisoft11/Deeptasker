import { Workspace } from '@/entities/Workspace'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'

export const usePermissionWorkspace = (workspace: Workspace) => {
  const {
    workspaceStore: { currentPermissionsWorkspace },
    authStore: { user }
  } = useRootStore()

  const isOwner = workspace.user?.id === user?.id

  return {
    canCreateProjects: currentPermissionsWorkspace?.createProjects || isOwner,
    canEditProjects: currentPermissionsWorkspace?.editProjects || isOwner,
    canRemoveProjects: currentPermissionsWorkspace?.deleteProjects || isOwner,
    canEditWorkspace: isOwner,
    canManageAdmins: isOwner,
    canDeleteWorkspace: isOwner
  }
}
