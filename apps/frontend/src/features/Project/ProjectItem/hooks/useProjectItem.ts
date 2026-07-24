import { useRef } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Project } from '@/entities/Project'
import { sidebarView } from '@/entities/Sidebar/const/const'
import { useTaskFilters } from '@/entities/Task'
import SubscriptionProjectEvent from '@/entities/lib/components/web_socket/events/SubscriptionProjectEvent'
import { RouterParams } from '@/shared/config/route.config'
import { PromiseHelper } from '@/shared/lib/helpers/promise.helper'
import { useCurrentView } from '@/shared/lib/hooks/useCurrentView'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { ProjectsNavigator } from '@/shared/lib/navigators/projects.navigator'
import { ReportsNavigator } from '@/shared/lib/navigators/reports.navigator'

interface Return {
  handleChangeProject: (
    project: Project,
    isChangeUrl?: boolean
  ) => Promise<void>
}

const useProjectItem = (): Return => {
  const navigate = useNavigate()

  const {
    workspaceStore,
    projectStore,
    taskStore,
    taskTimerStore,
    webSocketStore,
    folderStore,
    sprintStore,
    sidebarStore
  } = useRootStore()

  const { slugId } = useParams<RouterParams>()
  const { view } = useCurrentView()
  const { clearFilters } = useTaskFilters()

  const abortControllerRef = useRef<AbortController>()

  const handleChangeUrl = (projectSlug: string): void => {
    if (sidebarStore.viewContainer === sidebarView.reports) {
      navigate(
        ReportsNavigator.getProjectReports({
          currentWorkspaceId: workspaceStore.activeWorkspace.id,
          projectSlug
        })
      )
    } else {
      navigate(
        ProjectsNavigator.getExistProjectUrl({
          currentWorkspaceId: workspaceStore.activeWorkspace.id,
          projectSlug,
          view
        })
      )
    }
  }

  const handleChangeProject = async (
    project: Project,
    isChangeUrl: boolean = true
  ) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    if (
      projectStore.activeProject &&
      projectStore.activeProject.id === project.id &&
      slugId
    ) {
      return
    }

    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current?.signal as AbortSignal

    taskStore.loading = true
    projectStore.loading = true

    taskStore.clear()

    projectStore.activeProject = project
    await projectStore.updateFullProject(project)

    const event = new SubscriptionProjectEvent(project.id)
    webSocketStore.sendEvent(event)

    if (isChangeUrl) {
      handleChangeUrl(project.slug)
      clearFilters()
    }

    try {
      await Promise.all([
        PromiseHelper.runPromisesSequentially([
          () => taskStore.init(signal),
          () => sprintStore.init(),
          () => folderStore.init(),
          () => taskTimerStore.init(),
          () => projectStore.fetchCurrentUserPermissionsProject(project)
        ])
      ])
    } catch (e) {
      if (e.name === 'CanceledError') {
        return
      }
      throw e
    }

    taskStore.loading = false
    projectStore.loading = false
  }

  return {
    handleChangeProject
  }
}

export default useProjectItem
