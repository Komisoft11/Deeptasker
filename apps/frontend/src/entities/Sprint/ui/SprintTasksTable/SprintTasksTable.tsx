import { observer } from 'mobx-react-lite'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router'
import {
  TaskExecutorAutocomplete,
  TaskPriority,
  TaskStatus
} from '@/features/Task'
import { DeadlineDate } from '@/features/Task/DeadlineDate/DeadlineDate'
import { useSprints } from '@/entities/Sprint/lib/hooks/useSprints'
import { Sprint } from '@/entities/Sprint/model/sprint'
import { Task } from '@/entities/Task'
import { Trash } from '@/shared/assets/images/icons'
import { ENTITY } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { ProjectsNavigator } from '@/shared/lib/navigators/projects.navigator'
import { Button } from '@/shared/ui/Button/Button'
import { Table } from '@/shared/ui/Table/Table'
import { createColumnHelper } from '@/shared/ui/Table/lib/createColumnHelper'
import styles from './SprintTasksTable.module.scss'


interface Props {
  sprint: Sprint
}

export const SprintTasksTable: FC<Props> = observer(({ sprint }) => {
  const navigate = useNavigate()
  const {
    workspaceStore: { activeWorkspace },
    projectStore: { activeProject }
  } = useRootStore()
  const [params] = useSearchParams()
  const columnHelper = createColumnHelper<Task>()
  const { removeTaskAsync } = useSprints()

  const handleRemoveTask = async (task: Task) => {
    await removeTaskAsync.mutateAsync({
      id: Number(sprint.id),
      taskIds: [task.id]
    })
  }
  const { t } = useTranslation(ENTITY)

  const handleNavigate = (task: Task) => {
    navigate(
      ProjectsNavigator.getOpenTaskUrl({
        currentWorkspaceId: activeWorkspace.id,
        projectSlug: activeProject.slug,
        externalId: task.externalId,
        params
      })
    )
  }

  const columns = [
    columnHelper.accessor({
      id: 'title',
      header: () => t('task.taskName'),
      cell: (task) => (
        <div className={'flex flex-col'}>
          <p className={'body-14-16 truncate max-w-[250px]'}>{task.title}</p>
          {task.hasChildren && (
            <p className={'body-10 secondaryText'}>
              {t('task.subtasksCount', { count: task.subtasks.length })}
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
          <TaskPriority
            task={task}
            disabled={!!task.dateFinished}
            mode={'minimum'}
          />
        </div>
      )
    }),
    columnHelper.accessor({
      id: 'executor',
      header: () => t('task.info.executor'),
      cell: (task) => (
        <TaskExecutorAutocomplete
          task={task}
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
          rootClassName={'w-full max-w-[70%]'}
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
          className={
            'h-[38px] max-w-[70%] w-full flex items-center justify-center'
          }
        />
      )
    }),
    columnHelper.accessor({
      id: 'actions',
      header: () => '',
      cell: (task) => (
        <Button
          styleButton={'outline'}
          colorButton={'red'}
          className={'h-[38px] w-[38px]'}
          onClick={() => handleRemoveTask(task)}
          icon={<Trash className={'w-4 h-4'} />}
        />
      )
    })
  ]

  return (
    <div
      className={
        'flex-1 m-4 mt-0 border border-border rounded-lg overflow-y-auto scrollbarContainerOnBg'
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
          {sprint.tasks.map((task) => (
            <Table.Row key={task.id} className={styles.row}>
              {columns.map((column) => (
                <Table.Cell
                  style={{
                    position: 'relative'
                  }}
                  key={column.id}
                  className={styles.cell}
                  data-cell={column.id}
                  onClick={
                    column.id === 'title'
                      ? () => handleNavigate(task)
                      : undefined
                  }
                >
                  {column.cell(task)}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  )
})
