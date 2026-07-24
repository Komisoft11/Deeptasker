import { observer } from 'mobx-react-lite'
import React, { FC } from 'react'
import { MenuItem } from '@/features/Menu'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { ProjectsNavigator } from '@/shared/lib/navigators/projects.navigator'
import styles from './LastProjects.module.scss'

interface Props {
  isSidebarCollapsed: boolean
}

export const LastProjects: FC<Props> = observer(({ isSidebarCollapsed }) => {
  const {
    workspaceStore: { activeWorkspace },
    projectStore: { lastProjects }
  } = useRootStore()

  return (
    <div className={styles.body}>
      <p className={styles.title}>Last Projects</p>
      <nav className={styles.nav}>
        {lastProjects.map(({ id, title, slug }) => (
          <MenuItem
            key={id}
            to={ProjectsNavigator.getExistProjectUrl({
              currentWorkspaceId: activeWorkspace.id,
              projectSlug: slug
            })}
            title={title}
            isSidebarCollapsed={isSidebarCollapsed}
          />
        ))}
      </nav>
    </div>
  )
})
