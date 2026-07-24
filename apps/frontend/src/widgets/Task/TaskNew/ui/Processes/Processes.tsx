import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { FC } from 'react'
import { Controller } from 'react-hook-form'
import { Control } from 'react-hook-form/dist/types/form'
import { useTranslation } from 'react-i18next'
import { TaskPrioritySelect, TaskStatusSelect } from '@/widgets/Task'
import { TaskCreationData } from '@/widgets/Task/TaskNew/types/task-creation.interface'
import { TaskSprintSelect } from '@/widgets/Task/TaskSprintSelect/TaskSprintSelect'
import { ITaskStatus } from '@/entities/Project'
import {
  IPriorityOption,
  priorityOptions
} from '@/entities/Task/services/task-priorities'
import { ENTITY } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { DateTimePickerMantine } from '@/shared/ui/DateTimePickerMantine/DateTimePickerMantine'
import styles from './Processes.module.scss'


interface Props {
  control: Control<TaskCreationData>
  sprintId?: number
}

const StatusField: FC<{
  control: Control<TaskCreationData>
  statuses: ITaskStatus[]
  target: HTMLElement | undefined
}> = ({ control, statuses }) => {
  const { t } = useTranslation(ENTITY)
  return (
    <div className={styles.item}>
      <label className='body-14-16'>{t('task.info.status')}</label>
      <Controller
        name='status'
        control={control}
        defaultValue={statuses[0]?.id.toString()}
        render={({ field: { onChange, value } }) => (
          <TaskStatusSelect
            className={classNames(
              'flex justify-center w-[180px] h-[38px]',
              styles.status
            )}
            currentStatus={
              statuses.find((s) => s.id.toString() === value) || statuses[0]
            }
            statuses={statuses}
            changeTaskStatus={(status) => onChange(status)}
          />
        )}
      />
    </div>
  )
}

const PriorityField: FC<{
  control: Control<TaskCreationData>
  priorities: IPriorityOption[]
}> = ({ control, priorities }) => {
  const { t } = useTranslation(ENTITY)
  return (
    <div className={styles.item}>
      <label className='body-14-16'>{t('task.info.priority')}</label>
      <Controller
        name='priority'
        control={control}
        defaultValue={priorities[0]?.value.toString()}
        render={({ field: { onChange, value } }) => (
          <TaskPrioritySelect
            className={classNames(
              'border-none bg-hover hover:opacity-70 w-[180px] h-[38px]',
              styles.priority
            )}
            currentPriority={
              priorities.find((p) => p.value.toString() === value) ||
              priorities[0]
            }
            changeSelectedPriority={onChange}
          />
        )}
      />
    </div>
  )
}

const DeadlineField: FC<{
  control: Control<TaskCreationData>
}> = ({ control }) => {
  const { t } = useTranslation(ENTITY)
  return (
    <div className={styles.item}>
      <label className='body-14-16'>{t('task.info.deadline')}</label>
      <Controller
        name='deadline'
        control={control}
        render={({ field: { onChange, value } }) => (
          <DateTimePickerMantine
            dropdownType='popover'
            popoverProps={{
              withinPortal: false,
              position: 'bottom-end'
            }}
            minDate={new Date()}
            classNamesOverride={{
              wrapper: 'bg-hover hover:opacity-70 h-[38px]',
              root: classNames('rounded-lg w-[180px]', styles.deadline),
              input: styles.date,
              levelsGroup: 'border border-hover',
              presetList: 'bg-objects border border-hover border-r-none',
              timeWrapper: 'border-hover border-t-none'
            }}
            value={value}
            onChange={onChange}
            onClear={() => onChange(null)}
          />
        )}
      />
    </div>
  )
}

const SprintField: FC<{
  control: Control<TaskCreationData>
  target: HTMLElement | undefined
  sprintId?: number
}> = ({ control, target, sprintId }) => {
  const { t } = useTranslation(ENTITY)

  return (
    <div className={classNames(styles.item, styles.sprintItem)}>
      <label className='body-14-16 w-full'>{t('sprints.title')}</label>
      <Controller
        name='sprintId'
        control={control}
        render={({ field: { onChange } }) => (
          <TaskSprintSelect
            onSprintSelect={(sprintId) => onChange(sprintId)}
            container={target}
            className={classNames('hover:opacity-70', styles.sprint)}
            mode={'modal'}
            sprintId={sprintId}
          />
        )}
      />
    </div>
  )
}

export const Processes: FC<Props> = observer(({ control, sprintId }) => {
  const {
    projectStore: { activeProject }
  } = useRootStore()

  const target = document.querySelector(
    '.radix-dialog-task-creation'
  ) as HTMLElement

  if (!activeProject) return null

  return (
    <div className={'flex flex-col gap-1 justify-between w-full'}>
      <StatusField
        control={control}
        statuses={activeProject.statuses}
        target={target}
      />
      <PriorityField control={control} priorities={priorityOptions} />
      <DeadlineField control={control} />

      <SprintField control={control} target={target} sprintId={sprintId} />
    </div>
  )
})
