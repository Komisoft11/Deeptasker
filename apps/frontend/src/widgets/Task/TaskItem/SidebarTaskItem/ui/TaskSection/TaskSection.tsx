import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { CSSProperties, FC, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { TaskProjectTag } from '@/widgets/Task'
import { LabelSidebar } from '@/widgets/Task/TaskItem/SidebarTaskItem/ui/LabelSidebar/LabelSidebar'
import { TaskSprintSelect } from '@/widgets/Task/TaskSprintSelect/TaskSprintSelect'
import {
  TaskExecutorAutocomplete,
  TaskObserverAutocomplete,
  TaskPriority,
  TaskStatus,
  TimeColumn
} from '@/features/Task'
import { DeadlineDate } from '@/features/Task/DeadlineDate/DeadlineDate'
import { PlanStartDate } from '@/features/Task/PlanStartDate/PlanStartDate'
import { TaskAssignerAutocomplete } from '@/features/Task/TaskAssignerAutocomplete/TaskAssignerAutocomplete'
import { SprintStatuses } from '@/entities/Sprint/model/types/sprint.types'
import { ProjectPopover, usePermissionTask, useTasks } from '@/entities/Task'
import { FolderPopover } from '@/entities/Task/ui/FolderChip/FolderPopover'
import { ENTITY } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { LabelWithPopover } from '../LabelWithPopover/LabelWIthPopover'
import styles from './TaskSection.module.scss'

interface Props {
  workspaceTitle: string
  isActionButtonsShow: boolean
}

interface SectionItem {
  label: string
  content: ReactNode
  className?: string
}

interface Section {
  title: string
  items: SectionItem[]
  style?: CSSProperties
}

export const TaskSection: FC<Props> = observer(
  ({ workspaceTitle, isActionButtonsShow }) => {
    const { t } = useTranslation([ENTITY])
    const { updateAsync } = useTasks()
    const {
      folderStore: { folders },
      taskStore: { activeTask },
      sprintStore
    } = useRootStore()
    const permissions = usePermissionTask(activeTask)

    const isCompletedSprint = activeTask.sprintId
      ? sprintStore.get(activeTask.sprintId).status === SprintStatuses.Completed
      : false

    const changeSelectedSprint = async (selectedSprintId: number | null) => {
      return updateAsync.mutateAsync(
        {
          id: activeTask.id,
          dto: {
            sprintId:
              selectedSprintId !== null ? Number(selectedSprintId) : null
          }
        },
        {
          onSuccess: () => {
            activeTask.sprintId = Number(selectedSprintId)
          }
        }
      )
    }

    const sections: Section[] = [
      {
        title: t('task.sections.general', { ns: ENTITY }),
        items: [
          {
            label: t('workspace.label', { ns: ENTITY }),
            content: (
              <p className={'body-12 ellipsis max-w-[174px] p-[2px]'}>
                {workspaceTitle}
              </p>
            )
          },
          {
            label: t('project.single', { ns: ENTITY }),
            content: (
              <ProjectPopover
                disable={!permissions.canChangeProject()}
                task={activeTask}
                contentClassName={'max-w-[250px]'}
                triggerClassName={'h-8'}
              />
            )
          },
          ...(folders.length > 0
            ? [
                {
                  label: t('folder.title', { ns: ENTITY }),
                  content: (
                    <FolderPopover
                      disable={!permissions.canChangeFolder()}
                      task={activeTask}
                      triggerClassName={'h-8'}
                    />
                  )
                }
              ]
            : []),
          {
            label: t('task.info.status', { ns: ENTITY }),
            content: (
              <TaskStatus
                task={activeTask}
                className={'h-8'}
                disabled={!permissions.canExecuteTask}
              />
            )
          },
          {
            label: t('task.info.priority', { ns: ENTITY }),
            content: (
              <TaskPriority
                task={activeTask}
                disabled={!permissions.canChangePriority}
              />
            )
          },
          {
            label: t('project.tag.label', { ns: ENTITY }),
            content: (
              <TaskProjectTag
                task={activeTask}
                disabled={!permissions.canEditTags}
                triggerClassName={'w-max'}
              />
            ),
            className: 'flex-wrap'
          }
        ]
      },
      {
        title: t('task.sections.dates', { ns: ENTITY }),
        items: [
          {
            label: '',
            content: (
              <div className='flex gap-3 w-full'>
                <LabelWithPopover
                  label={t('task.info.dateStart', { ns: ENTITY })}
                  className={styles.fullWidth}
                >
                  <PlanStartDate
                    task={activeTask}
                    disabled={!permissions.canTrackTask}
                  />
                </LabelWithPopover>
                <LabelWithPopover
                  label={t('task.info.deadline', { ns: ENTITY })}
                  className={styles.fullWidth}
                >
                  <DeadlineDate
                    task={activeTask}
                    rootClassName={'w-full'}
                    disabled={isCompletedSprint}
                  />
                </LabelWithPopover>
              </div>
            )
          },
          {
            label: t('task.info.sprint', { ns: ENTITY }),
            content: (
              <TaskSprintSelect
                key={activeTask.sprintId ?? 'none'}
                disabled={!!activeTask.parentId}
                sprintId={activeTask.sprintId}
                onSprintSelect={(sprintId) => changeSelectedSprint(sprintId)}
                taskId={activeTask.id}
              />
            ),
            className: 'flex-col !items-start'
          }
        ],
        style: { flexWrap: 'nowrap' }
      },
      {
        title: t('task.sections.time', { ns: ENTITY }),
        items: [
          {
            label: '',
            content: (
              <TimeColumn disabled={!permissions.canChangeEstimatedTime} />
            )
          }
        ]
      },
      {
        title: t('task.sections.people', { ns: ENTITY }),
        items: [
          {
            label: t('task.info.executor', { ns: ENTITY }),
            content: (
              <TaskExecutorAutocomplete
                task={activeTask}
                className='w-full max-w-[174px]'
                isDisabled={!permissions.canChangeTaskExecutor}
              />
            )
          },
          {
            label: t('task.info.assigner', { ns: ENTITY }),
            content: (
              <TaskAssignerAutocomplete
                task={activeTask}
                className={'w-full max-w-[174px]'}
              />
            )
          },
          {
            label: t('task.info.observers', { ns: ENTITY }),
            content: (
              <TaskObserverAutocomplete
                task={activeTask}
                disabled={!permissions.canChangeObserver}
              />
            ),
            className: 'flex-col w-full !items-start gap-2'
          }
        ],
        style: { borderColor: 'transparent' }
      }
    ]

    return (
      <div
        className={classNames(
          isActionButtonsShow
            ? 'h-[calc(100dvh-73px-73px)]'
            : 'h-[calc(100dvh-73px)]',
          'overflow-y-auto w-[400px]',
          'scrollbarContainerOnBg'
        )}
      >
        {sections.map(({ title, items, style = {} }) => (
          <LabelSidebar key={title} sectionTitle={title} style={style}>
            {items.map(({ label, content, className }) => (
              <LabelWithPopover key={label} label={label} className={className}>
                {content}
              </LabelWithPopover>
            ))}
          </LabelSidebar>
        ))}
      </div>
    )
  }
)
