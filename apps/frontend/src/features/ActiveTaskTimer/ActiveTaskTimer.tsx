import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import useProjectItem from '@/features/Project/ProjectItem/hooks/useProjectItem'
import { TaskTimer } from '@/entities/Task'
import { useWorkspaces } from '@/entities/Workspace'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { ProjectsNavigator } from '@/shared/lib/navigators/projects.navigator'
import { Tooltip } from '@/shared/ui/Tooltip/Tooltip'
import styles from './ActiveTaskTimer.module.scss'


export const ActiveTaskTimer = observer(() => {
  const {
    taskStore: { trackingTask },
    workspaceStore: { activeWorkspace },
    projectStore: { activeProject }
  } = useRootStore()

  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState<number | null>(null)

  const { changeWorkspace } = useWorkspaces()
  const { handleChangeProject } = useProjectItem()
  const [params] = useSearchParams()

  const isTrackingTaskWorkspaceActive =
    trackingTask.project.workspace.id === activeWorkspace.id
  const isTrackingTaskProjectActive =
    trackingTask.projectId === activeProject.id

  const proxyOpenTask = async () => {
    if (!isTrackingTaskWorkspaceActive) {
      await changeWorkspace(trackingTask.project.workspace.id)
    }

    if (!isTrackingTaskProjectActive) {
      await handleChangeProject(trackingTask.project)
    }

    navigate(
      ProjectsNavigator.getOpenTaskUrl({
        currentWorkspaceId: activeWorkspace.id,
        projectSlug: activeProject.slug,
        externalId: trackingTask.externalId,
        params
      })
    )
  }

  const getTooltipContent = useCallback(() => {
    let content = trackingTask.title

    if (!isTrackingTaskProjectActive) {
      content = trackingTask.project.title + '/' + content
    }

    if (!isTrackingTaskWorkspaceActive) {
      content = trackingTask.project.workspace.title + '/' + content
    }

    return content
  }, [isTrackingTaskWorkspaceActive, isTrackingTaskProjectActive])

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth)
    }
  }, [])

  return (
    <div
      className={styles.container}
      ref={containerRef}
      onClick={(e) => e.stopPropagation()}
    >
      <Tooltip>
        <Tooltip.Trigger className={'p-0'}>
          <TaskTimer task={trackingTask} />
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side={'bottom'}
            className={'flex items-center justify-center p-1'}
            style={{ width: containerWidth ?? 'auto' }}
          >
            <p
              className={classNames(styles.taskTitle, 'body-14-16')}
              onClick={proxyOpenTask}
            >
              {getTooltipContent()}
            </p>
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip>
    </div>
  )
})
