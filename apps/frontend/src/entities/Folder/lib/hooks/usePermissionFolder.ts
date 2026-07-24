import { Folder, IFolderPermissionRole } from '@/entities/Folder'
import { usePermissionProject } from '@/entities/Project'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'

export const usePermissionFolder = (folder: Folder): IFolderPermissionRole => {
  const {
    authStore: { user }
  } = useRootStore()

  const { permissions: permissionsProject } = usePermissionProject()

  if (!folder) {
    return {
      canEditFolder: false,
      canDeleteFolder: false
    }
  }

  const isOwner = folder.user.id === user.id

  return {
    canEditFolder: permissionsProject.editFolders || isOwner,
    canDeleteFolder: permissionsProject.deleteFolders || isOwner
  }
}
