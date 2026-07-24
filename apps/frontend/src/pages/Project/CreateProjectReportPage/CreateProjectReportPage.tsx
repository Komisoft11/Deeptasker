import { observer } from 'mobx-react-lite'
import React from 'react'
import { useParams } from 'react-router'
import { CreateProjectReport } from '@/features/Report/CreateProjectReport/CreateProjectReport'
import { RouterParams } from '@/shared/config/route.config'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { ProjectsNavigator } from '@/shared/lib/navigators/projects.navigator'
import { Header } from '@/shared/ui/Header/Header'


export const CreateProjectReportPage = observer(() => {
  const {
    workspaceStore: { activeWorkspace },
    projectStore: { activeProject }
  } = useRootStore()
  const { folderId } = useParams<RouterParams>()

  const url = ProjectsNavigator.getExistProjectUrl({
    currentWorkspaceId: activeWorkspace.id,
    projectSlug: activeProject.slug,
    folderId
  })

  return (
    <div className={'flex flex-col h-full'}>
      <Header title={`${activeProject.title}`} navigateUrlToBack={url} />
      <div className={'flex-1 overflow-y-auto scrollbarContainerOnBg'}>
        <CreateProjectReport />
      </div>
    </div>
  )
})
