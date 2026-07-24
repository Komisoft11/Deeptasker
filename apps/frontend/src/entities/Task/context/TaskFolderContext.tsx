import {
  DndContext,
  DndContextProps,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragStartEvent,
  MeasuringStrategy,
  UniqueIdentifier,
  pointerWithin,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { observer } from 'mobx-react-lite'
import React, {
  FC,
  ReactNode,
  createContext,
  useContext,
  useMemo,
  useState
} from 'react'
import { Task, useFilterAndSortTaskFn, useTasks } from '@/entities/Task'
import {
  DistanceXYSensor,
  DistanceYSensor,
  MouseSensor,
  TouchSensor
} from '@/shared/lib/helpers/dnd.helper'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'

interface TaskFolderContextValue {
  activeId?: number
  projected: Projected | null
  flattenedItems: Task[]
  sortedIds: number[]
}

interface Projected {
  depth: number
  maxDepth: number
  minDepth: number
  parentId?: number | null
}

const TaskFolderContext = createContext<TaskFolderContextValue | undefined>(
  undefined
)

export const useTaskFolderContext = () => {
  const context = useContext(TaskFolderContext)
  if (!context) {
    throw new Error(
      'useTaskFolderContext must be used within a TaskFolderProvider'
    )
  }
  return context
}

interface TaskFolderProviderProps {
  children: ReactNode
}

export const TaskFolderProvider: FC<TaskFolderProviderProps> = observer(
  ({ children }) => {
    const { taskStore, folderStore } = useRootStore()
    const { filterAndSortTasks } = useFilterAndSortTaskFn()

    const { moveTaskAsync, changeFolderAsync } = useTasks()

    const rootTasks = filterAndSortTasks(
      folderStore.activeFolder
        ? folderStore.activeFolder.rootTasks
        : taskStore.getRootTasks()
    )

    const onDragEnd = ({ over }: DragEndEvent) => {
      if (!projected || !over || !activeId) {
        return
      }

      const ALLOW_MOVE_TO_FOLDER: boolean = Boolean(
        over.data.current?.type === 'folder' && overId
      )

      if (ALLOW_MOVE_TO_FOLDER) {
        changeFolderAsync.mutateAsync({
          taskId: activeId,
          folderId: overId as number
        })
        return
      }

      const parentTask = projected.parentId
        ? taskStore.get(projected.parentId)
        : undefined
      const activeTask = taskStore.get(activeId)
      const overIndex = flattenedItems.findIndex(
        ({ id }) => id === Number(over.id)
      )
      const activeIndex = flattenedItems.findIndex(({ id }) => id === activeId)
      const sortedItems = arrayMove(flattenedItems, activeIndex, overIndex)

      const oldParentId = activeTask.parent?.id
      const isInnerMove = oldParentId === parentTask?.id
      let oldActiveIndexIfNotInner

      if (!isInnerMove) {
        oldActiveIndexIfNotInner = oldParentId
          ? activeTask.parent
              ?.getBaseSorted()
              .findIndex((t) => t.id === activeTask.id)
          : rootTasks.findIndex((t) => t.id === activeTask.id)
      }

      // Update parent and order if moving between different parentId
      if (!isInnerMove && activeTask.parent?.id !== parentTask?.id) {
        updateParentAndOrder(activeTask, parentTask)
      }

      // Update task order for tasks in the old and new parent groups if not an inner move
      if (!isInnerMove && oldActiveIndexIfNotInner !== undefined) {
        updateTaskOrdersAfterMove(
          sortedItems,
          oldParentId,
          parentTask?.id,
          oldActiveIndexIfNotInner
        )
      }

      // Update task order within the same parent
      if (isInnerMove) {
        updateOrderWithinParent(activeTask, parentTask, sortedItems)
      }
    }

    const updateParentAndOrder = (
      activeTask: Task,
      parentTask: Task | undefined
    ) => {
      activeTask.depth = projected?.depth ?? 1
      if (activeTask.parent) activeTask.parent.removeSubtask(activeTask.id)

      activeTask.parent = parentTask
      if (parentTask) {
        parentTask.subtasks.push(activeTask)
        if (parentTask.isCollapsed) {
          const tasks = parentTask.getBaseSorted()
          const sortTasks = tasks.filter((t) => t.id != activeTask.id)
          const maxOrderTask = sortTasks.at(-1)
          const order = maxOrderTask ? maxOrderTask.order : 0
          activeTask.order = order + 1
        }
      }

      moveTaskAsync.mutateAsync({
        taskId: activeTask.id,
        taskFromId: activeTask.parentId,
        taskToId: parentTask?.id,
        order: activeTask.order
      })
    }

    const updateTaskOrdersAfterMove = (
      sortedItems: Task[],
      oldParentId?: number,
      newParentId?: number,
      oldActiveIndexIfNotInner?: number
    ) => {
      let currentTasks = oldParentId
        ? taskStore.get(oldParentId).getBaseSorted()
        : sortedItems.filter((r) => !r.parent)

      // Decrease the order of tasks in the old parent group
      currentTasks.slice(oldActiveIndexIfNotInner).forEach((t) => {
        t.order--
      })

      const newParent = newParentId ? taskStore.get(newParentId) : undefined
      if ((newParent && !newParent.isCollapsed) || !newParent) {
        // Recalculate orders for tasks in the new parent group
        currentTasks = newParent
          ? sortedItems.filter((r) => r.parent?.id === newParentId)
          : sortedItems.filter((r) => !r.parent)

        currentTasks.forEach((t, i) => {
          t.order = i + 1
        })
      }
    }

    const updateOrderWithinParent = (
      activeTask: Task,
      parentTask: Task | undefined,
      sortedItems: Task[]
    ) => {
      const sortedTasks = parentTask
        ? sortedItems.filter((r) => r.parent?.id === parentTask.id)
        : sortedItems.filter((r) => !r.parent)

      const proxyTasks = parentTask ? parentTask.getBaseSorted() : rootTasks
      const oldActiveIndex = proxyTasks.findIndex((r) => r.id === activeTask.id)
      const newActiveIndex = sortedTasks.findIndex(
        (r) => r.id === activeTask.id
      )

      if (oldActiveIndex < newActiveIndex) {
        const slice = proxyTasks.slice(oldActiveIndex + 1, newActiveIndex + 1)
        activeTask.order = slice.at(-1)?.order ?? 1
        slice.forEach((s) => s.order--)
      } else if (oldActiveIndex !== newActiveIndex) {
        const slice = proxyTasks.slice(newActiveIndex, oldActiveIndex)
        activeTask.order = slice.at(0)?.order ?? 1
        slice.forEach((s) => s.order++)
      }

      moveTaskAsync.mutateAsync({
        taskId: activeTask.id,
        order: activeTask.order
      })
    }

    const { activeId, overId, offsetLeft, ...dndProps } = useDnd(onDragEnd)

    const flatten = (items: Task[]): Task[] => {
      const filteredAndSortedItems = filterAndSortTasks(items)

      return filteredAndSortedItems.reduce<Task[]>((acc, item) => {
        const sortedSubtasks = flatten(filterAndSortTasks(item.subtasks)) // Apply to subtasks
        return [...acc, item, ...sortedSubtasks]
      }, [])
    }

    const flattenedItems = useMemo(() => {
      const flattenedTree = flatten(rootTasks)

      const collapsedItems = flattenedTree.reduce<string[]>(
        (acc, { subtasks, isCollapsed, id }) =>
          isCollapsed && subtasks.length ? [...acc, id + ''] : acc,
        []
      )

      return removeChildrenOf(
        flattenedTree,
        activeId ? [activeId + '', ...collapsedItems] : collapsedItems
      )
    }, [activeId, rootTasks, filterAndSortTasks])

    const sortedIds = useMemo(
      () => flattenedItems.map(({ id }) => id),
      [flattenedItems]
    )

    const projected =
      activeId && overId
        ? getProjection(flattenedItems, activeId, overId, offsetLeft, 50)
        : null

    const contextValue: TaskFolderContextValue = {
      activeId,
      projected,
      flattenedItems,
      sortedIds
    }

    return (
      <TaskFolderContext.Provider value={contextValue}>
        <DndContext {...dndProps}>{children}</DndContext>
      </TaskFolderContext.Provider>
    )
  }
)

const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always
  }
}

interface ReturnProps extends DndContextProps {
  activeId?: number
  overId?: number
  offsetLeft: number
}

const useDnd = (_onDragEnd: (e: DragEndEvent) => void): ReturnProps => {
  const sensors = useSensors(
    useSensor(MouseSensor, DistanceXYSensor),
    useSensor(TouchSensor, DistanceYSensor)
  )
  const [activeId, setActiveId] = useState<number | undefined>()
  const [overId, setOverId] = useState<number | undefined>()
  const [offsetLeft, setOffsetLeft] = useState(0)

  return {
    activeId,
    overId,
    sensors,
    offsetLeft,
    measuring,
    collisionDetection: pointerWithin,
    onDragStart(event: DragStartEvent) {
      document.body.style.setProperty('cursor', 'grabbing')
      setActiveId(Number(event.active.id))
    },

    onDragOver(event: DragOverEvent) {
      console.log('@dragOver')
      const overId = event.over?.id
      if (overId) {
        setOverId(Number(overId))
      }
    },
    onDragMove({ delta }: DragMoveEvent) {
      setOffsetLeft(delta.x)
    },
    onDragEnd(event: DragEndEvent) {
      setActiveId(undefined)
      setOverId(undefined)
      setOffsetLeft(0)
      document.body.style.setProperty('cursor', '')
      _onDragEnd(event)
    }
  }
}

function getProjection(
  items: Task[],
  activeId: UniqueIdentifier,
  overId: UniqueIdentifier,
  dragOffset: number,
  indentationWidth: number
) {
  const overItemIndex = items.findIndex(({ id }) => id === overId)
  const activeItemIndex = items.findIndex(({ id }) => id === activeId)
  const activeItem = items[activeItemIndex]
  const newItems = arrayMove(items, activeItemIndex, overItemIndex)
  const previousItem = newItems[overItemIndex - 1]
  const nextItem = newItems[overItemIndex + 1]
  const dragDepth = getDragDepth(dragOffset, indentationWidth)
  const projectedDepth = activeItem.depth + dragDepth
  const maxDepth = getMaxDepth({
    previousItem
  })
  const minDepth = getMinDepth({ nextItem })
  let depth = projectedDepth

  if (projectedDepth >= maxDepth) {
    depth = maxDepth
  } else if (projectedDepth < minDepth) {
    depth = minDepth
  }

  const getParentId = () => {
    if (depth === 1 || !previousItem) {
      return null
    }

    if (depth === previousItem.depth) {
      return previousItem.parent?.id
    }

    if (depth > previousItem.depth) {
      return previousItem.id
    }

    const newParent = newItems
      .slice(0, overItemIndex)
      .reverse()
      .find((item) => item.depth === depth)?.parent?.id

    return newParent ?? null
  }

  return {
    depth,
    maxDepth,
    minDepth,
    parentId: getParentId()
  }
}

function getDragDepth(offset: number, indentationWidth: number) {
  return Math.round(offset / indentationWidth)
}

function getMaxDepth({ previousItem }: { previousItem: Task }) {
  if (previousItem) {
    return previousItem.depth + 1
  }

  return 1
}

function getMinDepth({ nextItem }: { nextItem: Task }) {
  if (nextItem) {
    return nextItem.depth
  }

  return 1
}

function removeChildrenOf(items: Task[], ids: UniqueIdentifier[]) {
  const excludeParentIds = [...ids]

  return items.filter((item) => {
    if (item.parent && excludeParentIds.includes(item.parent.id + '')) {
      if (item.subtasks.length) {
        excludeParentIds.push(item.id + '')
      }
      return false
    }

    return true
  })
}
