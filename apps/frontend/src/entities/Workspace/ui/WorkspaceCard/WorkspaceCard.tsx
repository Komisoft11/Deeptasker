import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { useNavigate } from 'react-router'
import { Workspace, useWorkspaces } from '@/entities/Workspace'
import { WorkspaceInfo } from '@/entities/Workspace/ui/WorkspaceCard/ui/WorkspaceInfo/WorkspaceInfo'
import { Gear } from '@/shared/assets/images/icons'
import { optionWorkspaceTabs } from '@/shared/config/route.config'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import useStopPropagation from '@/shared/lib/hooks/useStopPropagation'
import { WorkspacesNavigator } from '@/shared/lib/navigators/worksapce.navigator'
import styles from './WorkspaceCard.module.scss'

interface Props {
  workspace: Workspace
  onClick?: (workspace: Workspace) => void
}

export const WorkspaceCard = observer(({ workspace, onClick }: Props) => {
  const { workspaceStore } = useRootStore()
  const { activeWorkspace } = workspaceStore
  const isActiveWorkspace = activeWorkspace.id === workspace.id
  const { handleStopPropagation } = useStopPropagation()
  const { changeWorkspace } = useWorkspaces()
  const navigate = useNavigate()

  async function handleOpenWorkspaceSettings(e: React.MouseEvent) {
    handleStopPropagation(e)
    await changeWorkspace(workspace.id, false)
    navigate(
      WorkspacesNavigator.getWorkspaceUrlWithId({
        currentWorkspaceId: activeWorkspace.id,
        workspaceId: workspace.id,
        tab: optionWorkspaceTabs.SETTINGS
      })
    )
  }

  return (
    <li
      className={classNames(styles.card, isActiveWorkspace && styles.active)}
      onClick={() => onClick?.(workspace)}
    >
      <div className={styles.header}>
        <h3 className={'line-clamp-2'}>{workspace.title}</h3>
        <div onClick={handleOpenWorkspaceSettings} className={styles.edit}>
          <Gear className={'w-4 h-4 icon'} />
        </div>
      </div>
      <WorkspaceInfo workspace={workspace} />
    </li>
  )
})
