import classNames from 'classnames'
import dayjs from 'dayjs'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Outlet } from 'react-router'
import { Project, usePermissionProject, useProjects } from '@/entities/Project'
import { usePermissionWorkspace } from '@/entities/Workspace/model/PermissionWorkspace'
import { Trash } from '@/shared/assets/images/icons'
import { optionProjectTabs } from '@/shared/config/route.config'
import { DATE_FORMAT } from '@/shared/const/date_format'
import { ENTITY, TRANSLATION } from '@/shared/const/translation'
import { useCurrentProjectSettings } from '@/shared/lib/hooks/useCurrentProjectSettings'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { ProjectsNavigator } from '@/shared/lib/navigators/projects.navigator'
import { Button } from '@/shared/ui/Button/Button'
import { Header } from '@/shared/ui/Header/Header'
import styles from './ProjectPage.module.scss'


interface Props {
  project: Project
}

export const ProjectPage = observer(({ project }: Props) => {
  const { t } = useTranslation([ENTITY, TRANSLATION])

  const {
    dialogStore: { deleteDialog },
    workspaceStore: { activeWorkspace }
  } = useRootStore()

  const { deleteAsync } = useProjects()

  const {
    permissions: { delete: canDelete }
  } = usePermissionProject(project)

  const { tab } = useCurrentProjectSettings()

  const { canRemoveProjects } = usePermissionWorkspace(activeWorkspace)

  const canDeleteCurrentProject = canDelete || canRemoveProjects

  const handleDeleteProject = () => {
    deleteDialog.title = `${project.title} / ${t('project.deleting', {
      ns: ENTITY
    })}`
    deleteDialog.body = <DeleteDialogBody project={project} />
    deleteDialog.buttonText = t('project.deleteButton', { ns: ENTITY })
    deleteDialog.deleteFunction = async () => deleteAsync.mutate(project)
  }

  const handleDelete = () => {
    project.folderCount || project.taskCount
      ? handleDeleteProject()
      : deleteAsync.mutate(project)
  }

  return (
    <div className={'flex flex-col h-full'}>
      <Header title={'Настройка проекта'}>
        {canDeleteCurrentProject && (
          <Button
            styleButton={'outline'}
            colorButton={'red'}
            className={'px-4 max-h-12 body-12'}
            onClick={handleDelete}
            icon={<Trash className={classNames('iconRed', styles.icon)} />}
          >
            {t('delete', { ns: TRANSLATION })}
          </Button>
        )}
      </Header>
      <div className={styles.content}>
        <div className={'h-[calc(100dvh-73px)] flex flex-col gap-4'}>
          <div className={styles.header}>
            <h3>{project.title}</h3>
            <p className={'secondaryText body-14-20'}>
              {t('dateCreated', { ns: TRANSLATION })}:{' '}
              {dayjs(project.dateCreated).format(DATE_FORMAT)} ·{' '}
              {t('workspace.creator', { ns: ENTITY })}: {project.user.firstName}{' '}
              {project.user.lastName}
            </p>
          </div>
          <div className={'flex gap-0.5 px-4'}>
            <Link
              className={classNames(
                styles.tab,
                'body-14-16',
                tab === optionProjectTabs.GENERAL && styles.active
              )}
              to={ProjectsNavigator.getProjectUrlWithId({
                currentWorkspaceId: activeWorkspace.id,
                projectId: project.id,
                tab: optionProjectTabs.GENERAL
              })}
            >
              {t('project.settings.tabs.general', { ns: ENTITY })}
            </Link>
            <Link
              className={classNames(
                styles.tab,
                'body-14-16',
                tab === optionProjectTabs.PEOPLE && styles.active
              )}
              to={ProjectsNavigator.getProjectUrlWithId({
                currentWorkspaceId: activeWorkspace.id,
                projectId: project.id,
                tab: optionProjectTabs.PEOPLE
              })}
            >
              {t('project.settings.tabs.people', { ns: ENTITY })}
            </Link>
            <Link
              className={classNames(
                styles.tab,
                'body-14-16',
                tab === optionProjectTabs.TAGS && styles.active
              )}
              to={ProjectsNavigator.getProjectUrlWithId({
                currentWorkspaceId: activeWorkspace.id,
                projectId: project.id,
                tab: optionProjectTabs.TAGS
              })}
            >
              {t('project.settings.tabs.tags', { ns: ENTITY })}
            </Link>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
})

interface DeleteDialogBodyProps {
  project: Project
}

function DeleteDialogBody({ project }: DeleteDialogBodyProps) {
  const { t } = useTranslation([ENTITY, TRANSLATION])

  return (
    <div className={'flex flex-col gap-6'}>
      <div className={'flex flex-col gap-2 pt-6'}>
        <h3>{project.title}</h3>
        <p className={'secondaryText body-14-20'}>
          {t('project.deleteProjectDescription', { ns: ENTITY })}
        </p>
      </div>
      <div className={'flex flex-col gap-2'}>
        <p className={'body-12 secondaryText'}>
          {t('project.youWillLose', { ns: ENTITY })}
        </p>
        <p className={'body-16 flex gap-1'}>
          {project.folderCount !== undefined && (
            <span>
              {t('folder.foldersCount', {
                ns: ENTITY,
                count: project.folderCount
              })}
            </span>
          )}
          {project.folderCount !== undefined &&
            project.taskCount !== undefined &&
            '·'}
          {project.taskCount !== undefined && (
            <span>
              {t('task.tasksCount', {
                ns: ENTITY,
                count: project.taskCount
              })}
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
