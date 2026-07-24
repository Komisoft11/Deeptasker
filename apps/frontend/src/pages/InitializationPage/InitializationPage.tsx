import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { MainPageNavigator } from '@/shared/lib/navigators/main.navigator'
import { ProjectsNavigator } from '@/shared/lib/navigators/projects.navigator'
import { Loading } from '@/shared/ui/Loading/Loading'

export const InitializationPage = observer(() => {
  const rootStore = useRootStore()
  const navigate = useNavigate()
  const {
    projectStore,
    folderStore,
    workspaceStore: { activeWorkspace }
  } = rootStore

  function getNavigationUrl() {
    if (!projectStore.projects.length) {
      return MainPageNavigator.getEmptyProjectUrl(activeWorkspace.id)
    }

    return ProjectsNavigator.getExistProjectUrl({
      currentWorkspaceId: activeWorkspace.id,
      projectSlug: projectStore.activeProject.slug,
      folderId: folderStore.activeFolder?.id
    })
  }

  useEffect(() => {
    if (!rootStore.loadingApp) {
      navigate(getNavigationUrl())
    }
  }, [rootStore.loadingApp])

  return (
    <div className={'flex justify-center items-center h-full'}>
      <Loading variant={'spinner'} className={'stroke-green-700'} />
    </div>
  )
})
