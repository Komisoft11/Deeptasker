import i18next from 'i18next'
import { StylesConfig } from 'react-select'
import {
  TaskActionsColumn,
  TaskExecutorAutocomplete,
  TaskNameColumn,
  TaskPriorityColumn,
  TaskStatusColumn,
  TaskTagsColumn
} from '@/features/Task'
import { DeadlineDate } from '@/features/Task/DeadlineDate/DeadlineDate'
import { Task } from '@/entities/Task'
import { IUser } from '@/entities/User'
import { StatusCodes } from '@/shared/const/statusCodes'
import { ENTITY, TRANSLATION } from '@/shared/const/translation'
import { IOption } from '@/shared/ui/Autocomplete'
import { createColumnHelper } from '@/shared/ui/Table/lib/createColumnHelper'

const columnHelper = createColumnHelper<Task>()

const customStyles: StylesConfig<IOption<IUser>> = {
  control: (provided) => ({
    ...provided,
    minHeight: '32px !important'
  }),
  input: (provided) => ({
    ...provided,
    fontSize: '12px !important',
    lineHeight: '16px !important'
  }),
  placeholder: (provided) => ({
    ...provided,
    fontSize: '12px !important',
    lineHeight: '16px !important'
  }),
  valueContainer: (provided) => ({
    ...provided,
    height: '32px',
    padding: '4px 0 4px 12px !important'
  })
}

export function getColumns() {
  return [
    columnHelper.accessor({
      id: 'title',
      header: () => i18next.t('name', { ns: TRANSLATION }),
      cell: (task) => <TaskNameColumn task={task} />
    }),
    columnHelper.accessor({
      id: 'priority',
      header: () => i18next.t('task.info.priority', { ns: ENTITY }),
      cell: (task) => (
        <TaskPriorityColumn
          task={task}
          disabled={task.status.code === StatusCodes.EXECUTED}
        />
      )
    }),
    columnHelper.accessor({
      id: 'executor',
      header: () => i18next.t('task.info.executor', { ns: ENTITY }),
      cell: (task) => (
        <TaskExecutorAutocomplete
          task={task}
          styles={customStyles}
          className={'w-full'}
          disabled={task.status.code === StatusCodes.EXECUTED}
        />
      )
    }),
    columnHelper.accessor({
      id: 'deadlineDate',
      header: () => i18next.t('task.info.deadline', { ns: ENTITY }),
      cell: (task) => (
        <DeadlineDate
          task={task}
          rootClassName={'w-full'}
          disabled={task.status.code === StatusCodes.EXECUTED}
        />
      )
    }),
    columnHelper.accessor({
      id: 'status',
      header: () => i18next.t('task.info.status', { ns: ENTITY }),
      cell: (task) => <TaskStatusColumn task={task} className={'h-8'} />
    }),
    columnHelper.accessor({
      id: 'tags',
      header: () => i18next.t('tags.title', { ns: ENTITY }),
      cell: (task) => <TaskTagsColumn task={task} />
    }),
    columnHelper.accessor({
      id: 'actions',
      header: () => '',
      cell: (task) => <TaskActionsColumn task={task} />
    })
  ]
}
