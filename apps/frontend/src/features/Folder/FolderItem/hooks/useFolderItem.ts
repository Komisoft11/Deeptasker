import { MouseEvent } from 'react'
import { useNavigate } from 'react-router'
import { useSearchParams } from 'react-router'
import { Folder } from '@/entities/Folder'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { ProjectsNavigator } from '@/shared/lib/navigators/projects.navigator'

interface IReturn {
  handleChangeFolder: (e?: MouseEvent<HTMLLIElement>) => void
}

export const useFolderItem = (folder: Folder): IReturn => {
  const {
    workspaceStore: { activeWorkspace },
    folderStore,
    projectStore: { activeProject }
  } = useRootStore()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const handleChangeFolder = (e?: MouseEvent<HTMLLIElement>) => {
    e?.stopPropagation()
    e?.preventDefault()

    const url = ProjectsNavigator.getExistProjectUrl({
      currentWorkspaceId: activeWorkspace.id,
      projectSlug: activeProject.slug,
      folderId: folder.id,
      params
    })

    if (folderStore.activeFolder && folderStore.activeFolder.id === folder.id) {
      return
    }

    folderStore.activeFolder = folder

    navigate(url)
  }

  return { handleChangeFolder }
}
