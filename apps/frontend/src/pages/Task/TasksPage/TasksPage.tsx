import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Link,
  Outlet,
  useNavigate,
  useParams,
  useSearchParams
} from 'react-router'
import { KanbanControlsProvider } from '@/widgets/KanbanPlanner'
import { KanbanPlannerLoader } from '@/widgets/KanbanPlanner/ui'
import { KanbanControls } from '@/widgets/KanbanPlanner/ui/KanbanControls/KanbanControls'
import { TaskHeader } from '@/widgets/Task'
import { TaskHeaderLoader } from '@/widgets/Task/TaskHeader/ui/TaskHeaderLoader/TaskHeaderLoader'
import { TaskTableLoader } from '@/widgets/Task/TaskTable/ui/TaskTableLoader/TaskTableLoader'
import { TaskFolderProvider } from '@/entities/Task/context/TaskFolderContext'
import { Kanban, List } from '@/shared/assets/images/icons'
import {
  NOT_FOUND_URL,
  RouterParams,
  viewTabs
} from '@/shared/config/route.config'
import { TRANSLATION } from '@/shared/const/translation'
import { isEmpty } from '@/shared/lib/helpers/main.helper'
import { useCurrentView } from '@/shared/lib/hooks/useCurrentView'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { ProjectsNavigator } from '@/shared/lib/navigators/projects.navigator'
import styles from './TasksPage.module.scss'


export const TasksPage = observer(() => {
  const { projectStore, taskStore } = useRootStore()

  const isLoading = projectStore.loading || taskStore.loading

  const { slugId } = useParams<RouterParams>()

  const navigate = useNavigate()

  const { isKanbanView } = useCurrentView()

  const isNoExistProjects =
    !projectStore.loading && isEmpty(projectStore.projects)

  useLayoutEffect(() => {
    const isInvalidProjectSlug = slugId !== projectStore.activeProject.slug

    if (isInvalidProjectSlug) {
      navigate(NOT_FOUND_URL)
    }
  }, [])

  if (isNoExistProjects) {
    return <></>
  }

  return (
    <TaskFolderProvider>
      <div className={styles.container}>
        {isLoading ? <TaskHeaderLoader /> : <TaskHeader />}
        <div className={styles.content}>
          <KanbanControlsProvider>
            <div className={'flex w-full justify-between'}>
              <ViewSwitcher />
              {isKanbanView && <KanbanControls />}
            </div>
            {isLoading ? (
              isKanbanView ? (
                <KanbanPlannerLoader />
              ) : (
                <TaskTableLoader />
              )
            ) : (
              <Outlet />
            )}
          </KanbanControlsProvider>
        </div>
      </div>
    </TaskFolderProvider>
  )
})

function ViewSwitcher() {
  const {
    workspaceStore: { activeWorkspace },
    projectStore
  } = useRootStore()

  const { isTableView, isKanbanView } = useCurrentView()

  const { t } = useTranslation(TRANSLATION)
  const [params] = useSearchParams()
  const { folderId } = useParams<RouterParams>()

  const dto = {
    currentWorkspaceId: activeWorkspace.id,
    projectSlug: projectStore.activeProject.slug,
    folderId,
    params
  }

  const tablePath = ProjectsNavigator.getExistProjectUrl({
    ...dto,
    view: viewTabs.TABLE
  })

  const kanbanPath = ProjectsNavigator.getExistProjectUrl({
    ...dto,
    view: viewTabs.KANBAN
  })

  return (
    <div className={styles.list}>
      <Link
        to={tablePath}
        className={classNames(
          styles.link,
          'body-14-16',
          isTableView && 'bg-hover border-border'
        )}
      >
        <List className='self-center h-4 w-4 icon' />
        {t('table')}
      </Link>
      <Link
        to={kanbanPath}
        className={classNames(
          styles.link,
          'body-14-16',
          isKanbanView && 'bg-hover border-border'
        )}
      >
        <Kanban className='self-center h-4 w-4 icon' />
        {t('kanban')}
      </Link>
    </div>
  )
}
