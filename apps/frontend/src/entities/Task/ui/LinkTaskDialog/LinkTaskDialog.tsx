import { observer } from 'mobx-react-lite'
import { FC, MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router'
import styled from 'styled-components'
import { Task, useTasks } from '@/entities/Task'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { ProjectsNavigator } from '@/shared/lib/navigators/projects.navigator'
import { Button } from '@/shared/ui/Button/Button'
import { Dialog, DialogProps } from '@/shared/ui/Dialog/Dialog'
import styles from './LinkTaskDialog.module.scss'

interface Props extends DialogProps {
  task: Task
}

export const LinkTaskDialog: FC<Props> = observer(
  ({ task, onOpenChange, ...props }) => {
    const {
      workspaceStore: { activeWorkspace },
      projectStore: { activeProject }
    } = useRootStore()
    const { unbindTaskAsync } = useTasks()
    const { t } = useTranslation()

    const parentTask: Task | undefined = task.parent

    const [params] = useSearchParams()

    const handleClick = async () => {
      return unbindTaskAsync.mutateAsync({
        taskId: task.id,
        parentId: parentTask?.id as number
      })
    }

    const navigate = useNavigate()
    const proxyOpenTask = (e: MouseEvent, parentTask: Task) => {
      onOpenChange?.(false)
      navigate(
        ProjectsNavigator.getOpenTaskUrl({
          currentWorkspaceId: activeWorkspace.id,
          projectSlug: activeProject.slug,
          externalId: parentTask.externalId,
          params
        })
      )
    }
    return (
      <Dialog {...props}>
        <Dialog.Content>
          <Dialog.Title>{t('task.parentTasks')}</Dialog.Title>
          {parentTask && parentTask && (
            <div className={styles.main}>
              <div className={styles.content}>
                <button
                  className={'px-1 py-[2px]'}
                  onClick={(e) => proxyOpenTask(e, parentTask)}
                >
                  {parentTask.title}
                </button>
                <Button
                  className={'small-text'}
                  onClick={() => handleClick()}
                  styleButton={'filled'}
                >
                  {t('task.untie')}
                </Button>
              </div>
              <Border />
            </div>
          )}
        </Dialog.Content>
      </Dialog>
    )
  }
)

const Border = styled.div`
  margin-top: 10px;
  width: 100%;
  height: 1px;
`
