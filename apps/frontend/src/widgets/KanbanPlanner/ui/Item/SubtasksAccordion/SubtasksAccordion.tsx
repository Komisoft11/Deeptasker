import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { ExecuteTask } from '@/widgets/Task'
import { TaskExecutorAutocomplete } from '@/features/Task'
import { UserAvatar } from '@/features/User'
import { AddTaskInput, Task, usePermissionTask } from '@/entities/Task'
import { CaretDown, UserPlus } from '@/shared/assets/images/icons'
import { RouterParams } from '@/shared/config/route.config'
import { StatusCodes } from '@/shared/const/statusCodes'
import { ENTITY } from '@/shared/const/translation'
import { LocalStorageHelper } from '@/shared/lib/helpers/local-storage.helper'
import { useCurrentView } from '@/shared/lib/hooks/useCurrentView'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { ProjectsNavigator } from '@/shared/lib/navigators/projects.navigator'
import { Accordion } from '@/shared/ui/Accordion/Accordion'
import { Popover } from '@/shared/ui/Popover/Popover'
import styles from './SubtasksAccordion.module.scss'


interface Props {
  task: Task
  isAddSubtask: boolean
  setAddSubtask: (isAddSubtask: boolean) => void
  value: string | undefined
  setValue: (value: string | undefined) => void
}

export const SubtasksAccordion = observer(
  ({ task, isAddSubtask, setAddSubtask, value, setValue }: Props) => {
    const {
      workspaceStore: { activeWorkspace },
      projectStore: { activeProject }
    } = useRootStore()
    const { canChangeTaskExecutor } = usePermissionTask(task)
    const isOpen = value === 'subtasks'
    const navigate = useNavigate()
    const { folderId } = useParams<RouterParams>()
    const { view } = useCurrentView()
    const [params] = useSearchParams()
    const { t } = useTranslation([ENTITY])

    const isShowId = LocalStorageHelper.getIsShowId()

    const handleClick = (
      e: React.MouseEvent<HTMLDivElement, MouseEvent>,
      subtask: Task
    ) => {
      const target = e.target as HTMLElement

      const isStopClick =
        target.closest('.DT_Autocomplete__menu') ||
        target.closest('[data-ignore-subtask-click]')

      if (isStopClick) {
        return
      }

      navigate(
        ProjectsNavigator.getOpenTaskUrl({
          currentWorkspaceId: activeWorkspace.id,
          projectSlug: activeProject.slug,
          externalId: subtask.externalId,
          folderId: folderId,
          view,
          params
        })
      )
    }

    return (
      <Accordion
        type={'single'}
        collapsible
        value={value}
        onValueChange={(v) => {
          setValue(v)
          if (v !== 'subtasks' && isAddSubtask) {
            setAddSubtask(false)
          }
        }}
      >
        <Accordion.Item value={'subtasks'} className={'flex flex-col gap-3'}>
          <Accordion.Trigger data-ignore-click className={styles.trigger}>
            <p className={'body-14-16 secondaryText font-normal'}>
              {isOpen
                ? t('task.subtasks.hide', { ns: ENTITY })
                : t('task.subtasks.show', { ns: ENTITY })}
            </p>
            <div className={'p-1'}>
              <CaretDown
                className={classNames(
                  'iconSecondary transition-transform duration-300',
                  isOpen && 'rotate-180'
                )}
              />
            </div>
          </Accordion.Trigger>
          <Accordion.Content className={styles.content} data-ignore-click>
            <div className={'flex flex-col gap-1'}>
              {isAddSubtask && (
                <AddTaskInput
                  parent={task}
                  afterSubmit={() => setAddSubtask(false)}
                  autoFocus
                  handleClickCancel={() => setAddSubtask(false)}
                />
              )}
              {task.subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className={styles.subtaskItem}
                  onClick={(e) => handleClick(e, subtask)}
                >
                  <div
                    className={classNames(
                      'flex',
                      isShowId ? 'items-start' : 'items-center'
                    )}
                  >
                    <ExecuteTask
                      task={subtask}
                      containerClassName={classNames(
                        'pr-2 border-none',
                        isShowId && 'pt-0'
                      )}
                    />
                    <div className={'flex flex-col gap-1'}>
                      {isShowId && (
                        <p className={'body-12 secondaryText'}>
                          #{subtask.externalId}
                        </p>
                      )}
                      <h4
                        className={classNames(
                          subtask.status.code === StatusCodes.EXECUTED &&
                            'line-through opacity-70',
                          'max-w-[200px] ellipsis'
                        )}
                      >
                        {subtask.title}
                      </h4>
                    </div>
                  </div>

                  <Popover>
                    <Popover.Trigger
                      className={classNames(
                        subtask.executor
                          ? 'p-0'
                          : 'flex bg-hover rounded p-2 hover:bg-hoverOnHover',
                        (!canChangeTaskExecutor || subtask.dateFinished) &&
                          styles.disabled,
                        subtask.executor && 'border-none'
                      )}
                      data-ignore-click='true'
                      data-ignore-subtask-click={'true'}
                    >
                      {subtask.executor ? (
                        <UserAvatar user={subtask.executor} data-ignore-click />
                      ) : (
                        <div>
                          <UserPlus className={'icon w-4 h-4'} />
                        </div>
                      )}
                    </Popover.Trigger>
                    <Popover.Content
                      align={'center'}
                      data-ignore-click='true'
                      className={'w-[300px]'}
                    >
                      <TaskExecutorAutocomplete task={subtask} />
                    </Popover.Content>
                  </Popover>
                </div>
              ))}
            </div>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    )
  }
)
