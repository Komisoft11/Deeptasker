import { ViewTabs, viewTabs } from '@/shared/config/route.config'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'

interface Return {
  view: ViewTabs
  isTableView: boolean
  isKanbanView: boolean
}

export const useCurrentView = (): Return => {
  const { taskPlanerStore } = useRootStore()

  return {
    view: taskPlanerStore.view,
    isTableView: taskPlanerStore.view === viewTabs.TABLE,
    isKanbanView: taskPlanerStore.view === viewTabs.KANBAN
  }
}
