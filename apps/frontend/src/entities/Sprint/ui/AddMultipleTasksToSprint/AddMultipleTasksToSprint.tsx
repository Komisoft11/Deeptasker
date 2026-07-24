import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import { observer } from 'mobx-react-lite'
import React, { Dispatch, SetStateAction, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatDateTime } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/CommentTab/helper/formatDateTime'
import {
  TaskExecutorAutocomplete,
  TaskPriority,
  TaskStatus
} from '@/features/Task'
import { DeadlineDate } from '@/features/Task/DeadlineDate/DeadlineDate'
import { useSprints } from '@/entities/Sprint/lib/hooks/useSprints'
import { Sprint } from '@/entities/Sprint/model/sprint'
import { SprintModalProps } from '@/entities/Sprint/ui/AddTaskToSprintController/AddTaskToSprintController'
import { Task } from '@/entities/Task'
import { ENTITY } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Button } from '@/shared/ui/Button/Button'
import { Checkbox } from '@/shared/ui/Checkbox/Checkbox'
import { Table } from '@/shared/ui/Table/Table'
import { createColumnHelper } from '@/shared/ui/Table/lib/createColumnHelper'
import styles from './AddMultiplyTasksToSprint.module.scss'


dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

interface Props {
  sprint: Sprint
  setOpenDialog: Dispatch<SetStateAction<SprintModalProps>>
}

export const AddMultipleTasksToSprint = observer(
  ({ sprint, setOpenDialog }: Props) => {
    const { taskStore } = useRootStore()
    const { addTasksAsync } = useSprints()
    const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([])
    const { t } = useTranslation(ENTITY)

    const tasksWithoutSprint = taskStore.tasks.filter((task) => {
      if (task.sprintId) return false
      if (!task.deadlineDate) return true

      const deadline = dayjs(task.deadlineDate)
      return (
        deadline.isSameOrAfter(sprint.dateStart) &&
        deadline.isSameOrBefore(sprint.dateEnd)
      )
    })

    const handleCheckboxChange = (taskId: number) => {
      setSelectedTaskIds((prev) =>
        prev.includes(taskId)
          ? prev.filter((id) => id !== taskId)
          : [...prev, taskId]
      )
    }

    const chooseAll = () => {
      if (selectedTaskIds.length === tasksWithoutSprint.length) {
        setSelectedTaskIds([])
      } else {
        setSelectedTaskIds(tasksWithoutSprint.map((task) => task.id))
      }
    }

    const allSelected = tasksWithoutSprint.every((task) =>
      selectedTaskIds.includes(task.id)
    )

    const handleAddTasks = async () => {
      await addTasksAsync.mutateAsync({
        id: sprint.id,
        taskIds: selectedTaskIds
      })
      setOpenDialog(null)
    }

    const columnHelper = createColumnHelper<Task>()

    const columns = [
      columnHelper.accessor({
        id: 'actions',
        header: () => (
          <Checkbox checked={allSelected} onCheckedChange={chooseAll} />
        ),
        cell: (task) => (
          <Checkbox
            checked={selectedTaskIds.includes(task.id)}
            onCheckedChange={() => handleCheckboxChange(task.id)}
          />
        )
      }),
      columnHelper.accessor({
        id: 'title',
        header: () => t('task.taskName'),
        cell: (task) => (
          <div className={'flex flex-col'}>
            <p className={'body-14-16 ellipsis max-w-[200px]'}>{task.title}</p>
            {task.hasChildren && (
              <p className={'body-10 secondaryText'}>
                {t('subtasksCount', { count: task.subtasks.length })}
              </p>
            )}
          </div>
        )
      }),
      columnHelper.accessor({
        id: 'priority',
        header: () => t('task.info.priority'),
        cell: (task) => (
          <div className={'max-w-[96px] w-full'}>
            <TaskPriority task={task} disabled mode={'minimum'} />
          </div>
        )
      }),
      columnHelper.accessor({
        id: 'executor',
        header: () => t('task.info.executor'),
        cell: (task) => (
          <TaskExecutorAutocomplete
            task={task}
            disabled={true}
            className={'max-w-[70%] w-full'}
          />
        )
      }),
      columnHelper.accessor({
        id: 'deadline',
        header: () => t('task.info.deadline'),
        cell: (task) => (
          <DeadlineDate
            task={task}
            disabled
            rootClassName={'w-full max-w-[70%] border border-hover'}
            classNameInput={'py-[10px]'}
          />
        )
      }),
      columnHelper.accessor({
        id: 'status',
        header: () => t('task.info.status'),
        cell: (task) => (
          <TaskStatus
            task={task}
            disabled
            className={
              'h-[38px] max-w-[70%] w-full flex items-center justify-center'
            }
          />
        )
      })
    ]

    return (
      <div className={'flex flex-col gap-6 h-full'}>
        <div className={'flex w-full justify-between items-center'}>
          <div className={'flex flex-col gap-1'}>
            <h4>{sprint.title}</h4>
            <p className={'secondaryText body-12 '}>{sprint.description}</p>
          </div>
          <p className={'body-14-16 p-2 bg-hover rounded-lg'}>
            {formatDateTime({ date: sprint.dateStart, includeTime: false })} -{' '}
            {formatDateTime({ date: sprint.dateEnd, includeTime: false })}
          </p>
        </div>
        <div
          className={
            'flex-1 border border-hover rounded-lg overflow-y-auto scrollbarContainerOnObjects max-h-[70%]'
          }
        >
          <Table>
            <Table.Head>
              <Table.Row className={styles.header}>
                {columns.map((column) => (
                  <Table.Cell
                    style={{
                      position: 'relative'
                    }}
                    key={column.id}
                    className={styles.cell}
                    data-cell={column.id}
                  >
                    <p className={'body-14-16'}>{column.header()}</p>
                  </Table.Cell>
                ))}
              </Table.Row>
            </Table.Head>
            <Table.Body className={styles.list}>
              {tasksWithoutSprint.map((task) => (
                <Table.Row key={task.id} className={styles.row}>
                  {columns.map((column) => (
                    <Table.Cell
                      style={{
                        position: 'relative'
                      }}
                      key={column.id}
                      className={styles.cell}
                      data-cell={column.id}
                    >
                      {column.cell(task)}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
        <Button
          styleButton={'filled'}
          className={'w-max px-4 py-3'}
          disabled={selectedTaskIds.length === 0}
          onClick={handleAddTasks}
        >
          {t('task.info.addTasks')} ({selectedTaskIds.length})
        </Button>
      </div>
    )
  }
)
