import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'
import { useMatches } from 'react-router'
import { MenuItem } from '@/features/Menu'
import { elementView, sidebarView } from '@/entities/Sidebar/const/const'
import { Clipboard, Reports } from '@/shared/assets/images/icons'
import { viewTabs } from '@/shared/config/route.config'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { ProjectsNavigator } from '@/shared/lib/navigators/projects.navigator'
import { ReportsNavigator } from '@/shared/lib/navigators/reports.navigator'
import styles from './MainMenu.module.scss'

interface Props {
  isSidebarCollapsed: boolean
}

export const MainMenu = observer(({ isSidebarCollapsed }: Props) => {
  const { t } = useTranslation()

  const {
    workspaceStore: { activeWorkspace },
    sidebarStore,
    projectStore: { activeProject, projects }
  } = useRootStore()

  const matches = useMatches()

  const handleOpenProjectSidebar = (isReports: boolean = false) => {
    if (sidebarStore.elementView === elementView.settings) {
      sidebarStore.elementView = elementView.project
    }

    if (isReports) {
      sidebarStore.viewContainer = sidebarView.reports
    } else {
      sidebarStore.viewContainer = sidebarView.tasks
    }

    sidebarStore.openLeftSecondSidebar()
  }

  const isTasksAndReportsVisible = projects.length > 0 && activeProject?.id

  if (!isTasksAndReportsVisible) {
    return <></>
  }

  const tasksUrl = ProjectsNavigator.getExistProjectUrl({
    currentWorkspaceId: activeWorkspace.id,
    projectSlug: activeProject.slug
  })

  const reportsUrl = ReportsNavigator.getProjectReports({
    currentWorkspaceId: activeWorkspace.id,
    projectSlug: activeProject.slug
  })

  const isActive = matches[matches.length - 1].pathname.includes(
    viewTabs.KANBAN
  )

  return (
    <nav className={styles.menu}>
      <MenuItem
        to={tasksUrl}
        onClick={() => handleOpenProjectSidebar()}
        title={t('task.title')}
        icon={<Clipboard className={'icon w-5 h-5'} />}
        isSidebarCollapsed={isSidebarCollapsed}
        isActive={isActive}
      />
      <MenuItem
        to={reportsUrl}
        onClick={() => handleOpenProjectSidebar(true)}
        title={t('report.title')}
        icon={<Reports className={'icon w-5 h-5'} />}
        isSidebarCollapsed={isSidebarCollapsed}
      />
    </nav>
  )
})
