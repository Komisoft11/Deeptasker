import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { useLocation, useNavigate } from 'react-router'
import useProjectItem from '@/features/Project/ProjectItem/hooks/useProjectItem'
import { Project } from '@/entities/Project'
import { Gear } from '@/shared/assets/images/icons'
import { optionProjectTabs } from '@/shared/config/route.config'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import useStopPropagation from '@/shared/lib/hooks/useStopPropagation'
import { ProjectsNavigator } from '@/shared/lib/navigators/projects.navigator'
import styles from './ProjectItem.module.scss'


interface Props {
  project: Project
  isActive: boolean
}

export const ProjectItem = observer(({ project, isActive }: Props) => {
  const {
    workspaceStore: { activeWorkspace }
  } = useRootStore()

  const { handleStopPropagation } = useStopPropagation()
  const { handleChangeProject } = useProjectItem()

  const location = useLocation()
  const navigate = useNavigate()

  const isSettingsPage = Object.values(optionProjectTabs).some((tab) => {
    return (
      location.pathname ===
      ProjectsNavigator.getProjectUrlWithId({
        currentWorkspaceId: activeWorkspace.id,
        projectId: project.id,
        tab
      })
    )
  })

  async function handleChangeActiveProject() {
    await handleChangeProject(project)
  }

  async function handleNavigateToProjectSettings(
    e: React.MouseEvent<HTMLDivElement>
  ) {
    handleStopPropagation(e)
    navigate(
      ProjectsNavigator.getProjectUrlWithId({
        currentWorkspaceId: activeWorkspace.id,
        projectId: project.id
      })
    )
    await handleChangeProject(project, false)
  }

  return (
    <div
      className={classNames(styles.project, isActive && styles.active)}
      onClick={handleChangeActiveProject}
    >
      <p className={classNames('body-14-16', styles.title)}>{project.title}</p>
      <div
        onClick={handleNavigateToProjectSettings}
        className={classNames(
          styles.settings,
          isSettingsPage || isActive ? 'opacity-1' : 'opacity-0'
        )}
      >
        <Gear className={'icon'} />
      </div>
    </div>
  )
})
