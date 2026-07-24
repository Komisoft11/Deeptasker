import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ProjectList } from '@/widgets/Project'
import { ProjectBlankCreator, ProjectSearch } from '@/features/Project'
import { FIRST_CREATION_STEP } from '@/entities/Guidance'
import { ProjectListSkeleton } from '@/entities/Project'
import { usePermissionWorkspace } from '@/entities/Workspace/model/PermissionWorkspace'
import { Magnify, Plus } from '@/shared/assets/images/icons'
import { MAX_PROJECTS, SHOW_NOTIFICATIONS } from '@/shared/const/projects'
import { ENTITY } from '@/shared/const/translation'
import useDialogAndPopover from '@/shared/lib/hooks/useDialogAndPopover'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Dialog } from '@/shared/ui/Dialog/Dialog'
import styles from './ProjectSidebar.module.scss'


export const ProjectSidebar = observer(() => {
  const { loadingApp, workspaceStore, projectStore } = useRootStore()
  const dialogAddProps = useDialogAndPopover()
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  if (loadingApp || !workspaceStore.activeWorkspace) {
    return <ProjectListSkeleton />
  }

  const { t } = useTranslation(ENTITY)

  const { canCreateProjects } = usePermissionWorkspace(
    workspaceStore.activeWorkspace
  )

  const isCreationTriggerVisible = canCreateProjects

  const projectsLeft =
    MAX_PROJECTS - projectStore.projects.length > 0
      ? MAX_PROJECTS - projectStore.projects.length
      : 0

  return (
    <div className={styles.sidebar}>
      <div className={styles.menu}>
        {!isSearchOpen && (
          <div className={styles.header}>
            <h3>{t('project.title')}</h3>

            <div className={'flex'}>
              {isCreationTriggerVisible &&
                projectStore.projects.length < MAX_PROJECTS && (
                  <div
                    id={FIRST_CREATION_STEP}
                    className={'iconContainer'}
                    onClick={() => dialogAddProps.onOpenChange(true)}
                  >
                    <Plus className={'w-4 h-4 icon'} />
                  </div>
                )}

              <div
                className={'iconContainer'}
                onClick={() => setIsSearchOpen(true)}
              >
                <Magnify className={'w-4 h-4 icon'} />
              </div>
            </div>
          </div>
        )}

        <div
          className={classNames(
            ' transition-transform duration-300',
            isSearchOpen
              ? 'translate-x-0 opacity-100 pointer-events-auto block'
              : 'translate-x-full opacity-0 pointer-events-none absolute top-4 left-0'
          )}
        >
          <ProjectSearch onClose={() => setIsSearchOpen(false)} />
        </div>
      </div>
      <div className={styles.projects}>
        <ProjectList />
      </div>
      {projectStore.projects.length > SHOW_NOTIFICATIONS && (
        <div className={'p-4 border-t border-border'}>
          <p className={'secondaryText body-12'}>
            {projectsLeft != 0
              ? t('project.projectsLeftMessage', {
                  count: projectsLeft
                })
              : t('project.deleteToCreateNew')}
          </p>
        </div>
      )}
      <Dialog {...dialogAddProps}>
        <Dialog.Content title={t('project.createNew')}>
          <ProjectBlankCreator
            afterCreate={() => dialogAddProps.onOpenChange(false)}
          />
        </Dialog.Content>
      </Dialog>
    </div>
  )
})
