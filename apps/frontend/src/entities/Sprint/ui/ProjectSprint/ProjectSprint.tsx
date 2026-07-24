import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { usePermissionProject } from '@/entities/Project'
import { useSprints } from '@/entities/Sprint/lib/hooks/useSprints'
import { SprintStatuses } from '@/entities/Sprint/model/types/sprint.types'
import {
  AddTaskToSprintController,
  SprintTasksTable,
  SprintUpdateForm
} from '@/entities/Sprint/ui'
import { Trash } from '@/shared/assets/images/icons'
import { Active, Ended, Future } from '@/shared/assets/images/icons/sprints'
import { RouterParams } from '@/shared/config/route.config'
import { ENTITY, TRANSLATION } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { SprintsNavigator } from '@/shared/lib/navigators/sprints.navigator'
import { Button } from '@/shared/ui/Button/Button'
import { Header } from '@/shared/ui/Header/Header'
import { Loading } from '@/shared/ui/Loading/Loading'
import { ProgressBar } from '@/shared/ui/ProgressBar/ProgressBar'


export const ProjectSprint = observer(() => {
  const {
    workspaceStore: { activeWorkspace },
    projectStore: { activeProject },
    sprintStore
  } = useRootStore()
  const {
    permissions: { deleteSprints, updateSprints }
  } = usePermissionProject()
  const { sprintId } = useParams<RouterParams>()
  const { deleteAsync } = useSprints()
  const { t } = useTranslation([TRANSLATION, ENTITY])

  const openedSprint = sprintId ? sprintStore.get(Number(sprintId)) : undefined

  const backPath = SprintsNavigator.getSprintsUrl({
    currentWorkspaceId: activeWorkspace.id,
    projectSlug: activeProject.slug
  })

  const handleDelete = async (id: number) => {
    await deleteAsync.mutateAsync({ id })
  }

  const finishedTasksNumber =
    openedSprint?.tasks.filter((task) => !!task.dateFinished).length ?? 0

  if (sprintStore.loading || !openedSprint) {
    return <Loading variant={'spinner'} />
  }

  return (
    <div className={'flex flex-col h-full'}>
      <Header title={openedSprint.title} navigateUrlToBack={backPath}>
        {openedSprint?.tasks.length > 0 && (
          <ProgressBar
            value={finishedTasksNumber}
            max={openedSprint.tasks.length}
            showPercentage={true}
          />
        )}

        <div className={'w-full flex gap-2 items-center justify-end'}>
          <div
            className={classNames(
              'flex gap-1 items-center px-4 py-2 h-10 rounded-lg',
              {
                'bg-accent': openedSprint.status === SprintStatuses.Active,
                'bg-textSecond': openedSprint.status === SprintStatuses.Planned,
                'bg-systemGreen':
                  openedSprint.status === SprintStatuses.Completed,
                'bg-default': !openedSprint.status
              }
            )}
          >
            {openedSprint.status === SprintStatuses.Active && (
              <Active className={'iconActive'} />
            )}
            {openedSprint.status === SprintStatuses.Planned && (
              <Future className={'iconActive'} />
            )}
            {openedSprint.status === SprintStatuses.Completed && (
              <Ended className={'iconActive'} />
            )}
            <p className={'body-14-16 text-activeText'}>
              {t(`sprints.statuses.${openedSprint?.status}`, { ns: ENTITY })}
            </p>
          </div>

          {deleteSprints && (
            <Button
              styleButton={'outline'}
              colorButton={'red'}
              icon={<Trash />}
              className={'px-4 py-2 body-14-16'}
              onClick={() => handleDelete(openedSprint.id)}
            >
              <p>{t('delete', { ns: TRANSLATION })}</p>
            </Button>
          )}
        </div>
      </Header>
      <SprintUpdateForm sprint={openedSprint} />
      {openedSprint.tasks.length > 0 ? (
        <SprintTasksTable sprint={openedSprint} />
      ) : (
        <p className={'secondaryText p-4 body-12 flex-1 w-full text-center'}>
          {t('sprints.sprintTasksPlaceholder', { ns: ENTITY })}
        </p>
      )}
      {updateSprints && <AddTaskToSprintController sprint={openedSprint} />}
    </div>
  )
})
