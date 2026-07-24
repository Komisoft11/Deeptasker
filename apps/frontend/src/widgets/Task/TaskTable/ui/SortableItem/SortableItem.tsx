import { AnimateLayoutChanges, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { CSSProperties, Dispatch, SetStateAction } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import styles from '@/widgets/Task/TaskTable/TaskTable.module.scss'
import { getColumns } from '@/widgets/Task/TaskTable/lib/getColumns/getColumns'
import { AddSubtaskRow } from '@/widgets/Task/TaskTable/ui/AddSubtaskRow/AddSubtaskRow'
import { TaskActionsColumn } from '@/features/Task'
import { Task, usePermissionTask } from '@/entities/Task'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import useStopPropagation from '@/shared/lib/hooks/useStopPropagation'
import { ProjectsNavigator } from '@/shared/lib/navigators/projects.navigator'
import { Table } from '@/shared/ui/Table/Table'

const animateLayoutChanges: AnimateLayoutChanges = ({
  isSorting,
  wasDragging
}) => !(isSorting || wasDragging)

interface SortableItemProps {
  dragOverlay?: boolean
  task: Task
  depth: number
  clone?: boolean
  currentTaskId?: number | null
  setCurrentTaskId?: Dispatch<SetStateAction<number | null>>
  parentId?: number
}

export const SortableItem = observer(
  ({
    task,
    depth,
    clone = false,
    dragOverlay,
    currentTaskId,
    setCurrentTaskId,
    parentId,
    ...props
  }: SortableItemProps) => {
    const {
      transform,
      transition,
      attributes,
      listeners,
      isSorting,
      setNodeRef
    } = useSortable({
      id: task.id,
      data: { type: 'task', task },
      animateLayoutChanges
    })
    const navigate = useNavigate()

    const {
      workspaceStore: { activeWorkspace },
      authStore: { user }
    } = useRootStore()

    const isTracking =
      !task.isTrackingByOtherUser &&
      task.activeDate &&
      task.executor?.id === user.id

    const { folderId } = useParams()
    const { handleStopPropagation } = useStopPropagation()
    const { canOpenTask, canMoveTask, canCreateSubTasks } =
      usePermissionTask(task)
    const [params] = useSearchParams()

    const style: CSSProperties = {
      transform: CSS.Translate.toString(transform),
      transition
    }

    const handleOpenTask = () => {
      navigate(
        ProjectsNavigator.getOpenTaskUrl({
          currentWorkspaceId: activeWorkspace.id,
          projectSlug: task.project.slug,
          externalId: task.externalId,
          folderId,
          params
        })
      )
    }

    const columns = getColumns()

    const children = columns.map((column, index) => {
      return (
        <Table.Cell
          className={styles.cell}
          key={`${task.id}-${column.id}`}
          style={{
            paddingLeft: index === 0 ? `${4 + 16 * (depth - 1)}px` : '4px'
          }}
          data-cell={column.id}
          onClick={handleStopPropagation}
        >
          {column.id === 'actions' ? (
            <TaskActionsColumn
              task={task}
              setCurrentTaskId={setCurrentTaskId}
            />
          ) : (
            column.cell(task)
          )}
        </Table.Cell>
      )
    })

    return (
      <>
        {canMoveTask ? (
          <Table.Row
            ref={setNodeRef}
            className={classNames(
              styles.row,
              clone && styles.clone,
              isTracking && styles.tracking,
              task.id === parentId && styles.parent,
              isSorting && styles.disableInteraction,
              currentTaskId && 'opacity-50',
              !canOpenTask && styles.canNotOpen,
              task.dateFinished && styles.executed
            )}
            style={style}
            onClick={() => canOpenTask && handleOpenTask()}
            {...attributes}
            {...listeners}
            {...props}
          >
            {children}
          </Table.Row>
        ) : (
          <Table.Row
            className={classNames(
              styles.row,
              isTracking && styles.tracking,
              task.id === parentId && styles.parent,
              isSorting && styles.disableInteraction,
              currentTaskId && 'opacity-50',
              'hover:cursor-default'
            )}
            style={style}
            onClick={() => canOpenTask && handleOpenTask()}
            {...props}
          >
            {children}
          </Table.Row>
        )}
        {canCreateSubTasks && currentTaskId === task.id && (
          <AddSubtaskRow
            parentTask={task}
            depth={depth}
            setCurrentTaskId={setCurrentTaskId}
          />
        )}
      </>
    )
  }
)
