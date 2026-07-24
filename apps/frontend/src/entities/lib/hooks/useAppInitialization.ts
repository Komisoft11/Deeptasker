import { useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { Project } from '@/entities/Project'
import { Workspace } from '@/entities/Workspace'
import SubscriptionProjectEvent from '@/entities/lib/components/web_socket/events/SubscriptionProjectEvent'
import SubscriptionWorkspaceEvent from '@/entities/lib/components/web_socket/events/SubscriptionWorkspaceEvent'
import { NOT_FOUND_URL, RouterParams } from '@/shared/config/route.config'
import { initErrorCollector } from '@/shared/helpers/errorCollector'
import { initLogCollector } from '@/shared/helpers/logCollector'
import { consoLER } from '@/shared/lib/helpers/log'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'

export const useAppInitialization = () => {
  const rootStore = useRootStore()
  const { authStore, webSocketStore } = rootStore
  const params = useParams<RouterParams>()
  const navigate = useNavigate()
  const [filters] = useSearchParams()

  const subscribe = (workspace: Workspace, project?: Project) => {
    if (project) {
      const event = new SubscriptionProjectEvent(project.id)
      webSocketStore.sendEvent(event)
    }

    const event = new SubscriptionWorkspaceEvent(workspace.id)
    webSocketStore.sendEvent(event)
  }

  useEffect(() => {
    if (
      !authStore.isAppInitialization &&
      authStore.isAuth &&
      !rootStore.loadingApp
    ) {
      consoLER('APP INIT')
      // TODO:: а что если подключение к сокету будет долгое ?
      webSocketStore.connect()

      rootStore
        .init(params, filters)
        .then(() => {
          const activeWorkspace = rootStore.workspaceStore.activeWorkspace
          const activeProject = rootStore.projectStore.activeProject

          subscribe(activeWorkspace, activeProject)
          initLogCollector()
          initErrorCollector()
        })
        .catch(() => {
          navigate(NOT_FOUND_URL)
        })
    }

    return () => {
      //webSocketStore.disconnect()
    }
  }, [authStore.isAppInitialization, authStore.isAuth, rootStore.loadingApp])
}
