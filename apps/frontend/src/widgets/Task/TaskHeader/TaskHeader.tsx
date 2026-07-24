import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import 'react-loading-skeleton/dist/skeleton.css'
import { useNavigate, useParams } from 'react-router'
import { InvitePeople } from '@/widgets/Project'
import { TaskNew } from '@/widgets/Task'
import { BreadcrumbsFolder } from '@/features/Folder'
import { SearchInput } from '@/features/Search'
import { usePermissionProject } from '@/entities/Project'
import {
  Calendar,
  Gear,
  PlusCircle,
  Table,
  UserPlus,
  VerticalDots
} from '@/shared/assets/images/icons'
import { NOT_FOUND } from '@/shared/config/api.config'
import { RouterParams } from '@/shared/config/route.config'
import { ENTITY, TRANSLATION } from '@/shared/const/translation'
import { useCurrentView } from '@/shared/lib/hooks/useCurrentView'
import useDialogAndPopover from '@/shared/lib/hooks/useDialogAndPopover'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { ProjectsNavigator } from '@/shared/lib/navigators/projects.navigator'
import { ReportsNavigator } from '@/shared/lib/navigators/reports.navigator'
import { SprintsNavigator } from '@/shared/lib/navigators/sprints.navigator'
import { Button } from '@/shared/ui/Button/Button'
import { ButtonFilter } from '@/shared/ui/Button/ButtonFilter/ButtonFilter'
import { Dialog } from '@/shared/ui/Dialog/Dialog'
import { Header } from '@/shared/ui/Header/Header'
import { Popover } from '@/shared/ui/Popover/Popover'
import { ProgressBar } from '@/shared/ui/ProgressBar/ProgressBar'
import styles from './TaskHeader.module.scss'


export const TaskHeader = observer(() => {
  const {
    workspaceStore: { activeWorkspace },
    projectStore,
    taskFilterStore,
    taskStore,
    sidebarStore,
    folderStore
  } = useRootStore()
  const { activeProject } = projectStore

  const {
    permissions: { addUsers: canAddUsers, createTasks, generateReports }
  } = usePermissionProject(activeProject)

  const navigate = useNavigate()

  const popoverProps = useDialogAndPopover()

  const isDirty: boolean = !!taskFilterStore.activeFilters.length

  const { folderId } = useParams<RouterParams>()

  const { view, isKanbanView } = useCurrentView()

  const { t } = useTranslation([TRANSLATION, ENTITY])

  const [openDialog, setOpenDialog] = useState<'task' | 'invite' | null>(null)

  useEffect(() => {
    ;(async function setterFolder() {
      const _folderId = Number(folderId)

      if (_folderId) {
        try {
          folderStore.activeFolder = folderStore.get(_folderId)
        } catch (e) {
          navigate(NOT_FOUND)
        }
      }
    })()
  }, [folderId])

  const handleClick = () => {
    navigate(
      SprintsNavigator.getSprintsUrl({
        currentWorkspaceId: activeWorkspace.id,
        projectSlug: activeProject.slug
      })
    )
  }

  const handleFiltersClick = () => {
    sidebarStore.isRightOpen
      ? sidebarStore.closeRightSidebar()
      : sidebarStore.openRightSidebar()

    if (isKanbanView) {
      sidebarStore.collapseLeftFirstSidebar()
    }
  }

  const handleSettingsClick = () => {
    navigate(
      ProjectsNavigator.getProjectUrlWithId({
        currentWorkspaceId: activeWorkspace.id,
        projectId: activeProject.id
      })
    )
  }

  const handleReportClick = () => {
    navigate(
      ReportsNavigator.getProjectCreateReport({
        currentWorkspaceId: activeWorkspace.id,
        projectSlug: projectStore.activeProject.slug,
        folderId,
        view
      })
    )
  }

  const isShowCreateTask = !isKanbanView && createTasks

  return (
    <Header
      title={<HeaderTitle />}
      withProjectSidebarOpen
      withBreadcrumbs
      mainInfoClassName={isKanbanView ? '!w-[calc((100%-32px)/3)]' : undefined}
    >
      {isKanbanView &&
        activeProject.taskCount != undefined &&
        activeProject.taskCount != 0 && (
          <div
            className={isKanbanView ? '!w-[calc((100%-32px)/3)]' : undefined}
          >
            <ProgressBar
              value={taskStore.finishedTasks.length}
              max={activeProject.taskCount}
              showPercentage={true}
              className={'!max-w-[200px]'}
            />
          </div>
        )}
      <div
        className={classNames(
          styles.filter,
          isKanbanView && '!w-[calc((100%-32px)/3)]'
        )}
      >
        <SearchInput />
        <Button
          styleButton={'filled'}
          colorButton={'dark'}
          className={styles.button}
          onClick={handleSettingsClick}
        >
          <Gear className={'w-5 h-5 icon'} />
        </Button>

        <ButtonFilter
          onClick={handleFiltersClick}
          isActive={sidebarStore.isRightOpen}
          isDirty={isDirty}
        />

        <Popover {...popoverProps}>
          <Popover.Trigger className={'p-[10px] hover:bg-hover'}>
            <VerticalDots className={'icon w-5 h-5'} />
          </Popover.Trigger>
          <Popover.Content className={styles.menu} align={'end'}>
            {isShowCreateTask && (
              <div
                className={styles.item}
                onClick={() => setOpenDialog('task')}
              >
                <PlusCircle className={'w-4 h-4 icon'} />
                <p>{t('task.info.addTask', { ns: ENTITY })}</p>
              </div>
            )}

            {canAddUsers && (
              <div
                className={styles.item}
                onClick={() => setOpenDialog('invite')}
              >
                <UserPlus className={'w-4 h-4 icon'} />
                <p>{t('invite', { ns: TRANSLATION })}</p>
              </div>
            )}

            {generateReports && (
              <div className={styles.item} onClick={handleReportClick}>
                <Table className={'w-4 h-4 icon'} />
                <p>{t('report.create', { ns: ENTITY })}</p>
              </div>
            )}

            <div className={styles.item} onClick={handleClick}>
              <Calendar className={'w-4 h-4 icon'} />
              <p>{t('sprints.title', { ns: ENTITY })}</p>
            </div>
          </Popover.Content>
        </Popover>

        <Dialog
          open={openDialog === 'task'}
          onOpenChange={() => setOpenDialog(null)}
        >
          <Dialog.Content
            title={'Создание новой задачи'}
            className={classNames(
              'radix-dialog-task-creation',
              'w-full max-w-[75vw] !z-[auto]'
            )}
          >
            <TaskNew onOpenChange={() => setOpenDialog(null)} />
          </Dialog.Content>
        </Dialog>

        <Dialog
          open={openDialog === 'invite'}
          onOpenChange={() => setOpenDialog(null)}
        >
          <Dialog.Content
            title={'Приглашение людей'}
            className={'radix-dialog-project-invite'}
          >
            <InvitePeople setOpenDialog={setOpenDialog} />
          </Dialog.Content>
        </Dialog>
      </div>
    </Header>
  )
})

const HeaderTitle = observer(() => {
  const { isKanbanView } = useCurrentView()

  const { t } = useTranslation(ENTITY)

  const {
    projectStore: { activeProject },
    folderStore: { activeFolder }
  } = useRootStore()

  const taskCount = activeFolder
    ? activeFolder.tasks.length
    : activeProject.taskCount
  const folderCount = activeFolder
    ? activeFolder.subFolders.length
    : activeProject.folderCount

  const hiddenTaskCount = !taskCount
  const hiddenFolderCount = !folderCount
  const hiddenAllCounters = !(taskCount && folderCount)

  return (
    <div className={'flex gap-2 items-center pr-4'}>
      <BreadcrumbsFolder />
      {!isKanbanView && (
        <div className={styles.counters}>
          {!hiddenTaskCount && (
            <p>{t('task.tasksCount', { count: taskCount, ns: ENTITY })}</p>
          )}
          {!hiddenAllCounters && <p> · </p>}
          {!hiddenFolderCount && (
            <p>
              {t('folder.foldersCount', { count: folderCount, ns: ENTITY })}
            </p>
          )}
        </div>
      )}
    </div>
  )
})
