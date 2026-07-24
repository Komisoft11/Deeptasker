import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { WorkspaceCreate } from '@/widgets/Workspace'
import { Workspace, WorkspaceCard, useWorkspaces } from '@/entities/Workspace'
import { Plus } from '@/shared/assets/images/icons'
import { ENTITY } from '@/shared/const/translation'
import useDialogAndPopover from '@/shared/lib/hooks/useDialogAndPopover'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { WorkspacesNavigator } from '@/shared/lib/navigators/worksapce.navigator'
import { Breadcrumbs } from '@/shared/ui/Breadcrumbs/Breadcrumbs'
import { IBreadcrumb } from '@/shared/ui/Breadcrumbs/type/breadcrumbs.interface'
import { Button } from '@/shared/ui/Button/Button'
import { Dialog } from '@/shared/ui/Dialog/Dialog'
import { Header } from '@/shared/ui/Header/Header'
import styles from './WorkspaceGrid.module.scss'

const WORKSPACE_MAX_AMOUNT = 5

export const WorkspaceGrid: FC = observer(() => {
  const { t } = useTranslation()

  const { workspaceStore } = useRootStore()
  const { changeWorkspace } = useWorkspaces()
  const createDialog = useDialogAndPopover(false)

  const handleWorkspaceClick = async (workspace: Workspace) => {
    await changeWorkspace(workspace.id)
  }

  const breadcrumbs: IBreadcrumb[] = [
    {
      id: 'ws main',
      title: t('workspace.title', { ns: ENTITY }),
      url: WorkspacesNavigator.getWorkspaceGridUrl(
        workspaceStore.activeWorkspace.id
      )
    },
    {
      id: `ws create`,
      title: t('workspace.new', { ns: ENTITY }),
      url: WorkspacesNavigator.getWorkspaceGridUrl(
        workspaceStore.activeWorkspace.id
      )
    }
  ]

  const workspaceRemaining =
    WORKSPACE_MAX_AMOUNT - workspaceStore.workspaces.length

  const isShowAddButton =
    workspaceStore.workspaces.length < WORKSPACE_MAX_AMOUNT

  return (
    <div className={styles.container}>
      <Header title={t('workspace.title')} />
      <ul className={styles.cards}>
        {workspaceStore.workspaces.map((workspace) => (
          <WorkspaceCard
            onClick={() => handleWorkspaceClick(workspace)}
            key={workspace.id}
            workspace={workspace}
          />
        ))}
      </ul>
      {isShowAddButton ? (
        <Dialog {...createDialog}>
          <Dialog.Trigger asChild>
            <div className={styles.buttonContainer}>
              <Button
                styleButton={'filled'}
                colorButton={'dark'}
                className={styles.addButton}
              >
                <p className={'body-16 flex gap-2 items-center'}>
                  <Plus className={'w-4 h-4 icon'} />
                  {t('workspace.added')}
                </p>
              </Button>
              <p className={'body-12 secondaryText'}>
                {t('workspace.workspaceRemaining', {
                  ns: ENTITY,
                  count: workspaceRemaining
                })}
              </p>
            </div>
          </Dialog.Trigger>
          <Dialog.Content title={<Breadcrumbs breadcrumbs={breadcrumbs} />}>
            <WorkspaceCreate
              afterCreate={() => createDialog.onOpenChange(false)}
            />
          </Dialog.Content>
        </Dialog>
      ) : (
        <div className={classNames(styles.buttonContainer, 'h-[65px]')}>
          <p className={'secondaryText body-14-16'}>
            {t('workspace.limitReached', { ns: ENTITY })}
          </p>
        </div>
      )}
    </div>
  )
})
