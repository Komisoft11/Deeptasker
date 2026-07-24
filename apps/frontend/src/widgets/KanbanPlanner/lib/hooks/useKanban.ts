import {
  CollisionDetection,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  UniqueIdentifier,
  getFirstCollision,
  pointerWithin,
  rectIntersection
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import {
  mapContainer,
  mapContainers,
  mapFilledContainers,
  mapItem
} from '@/widgets/KanbanPlanner/lib/utils/kanbanMappers'
import {
  FilledContainers,
  KanbanContainer
} from '@/widgets/KanbanPlanner/types/KanbanItem.interface'
import { ITaskStatus } from '@/entities/Project'
import {
  Task,
  TaskService,
  useFilterAndSortTaskFn,
  useTasks
} from '@/entities/Task'
import { StatusCodes } from '@/shared/const/statusCodes'
import { consoLER } from '@/shared/lib/helpers/log'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'

interface Return {
  containers: KanbanContainer[]
  filledContainers: FilledContainers
  removeItemFromContainer(
    itemId: UniqueIdentifier,
    containerId: KanbanContainer
  ): void
  appendItemToContainer(
    itemId: UniqueIdentifier,
    containerId: KanbanContainer
  ): void
  removeContainer(containerId: KanbanContainer): void
  appendContainer(containerId: KanbanContainer): void
  duplicateContainer(tasks: Task[], status: ITaskStatus): void
  moveItems(fromContainer: KanbanContainer, toContainer: KanbanContainer): void
  collisionDetectionStrategy: CollisionDetection
  onDragStart: (event: DragStartEvent) => void
  onDragOver: (event: DragOverEvent) => void
  onDragEnd: (event: DragEndEvent) => void
  isColumnDrag: boolean
  activeId: UniqueIdentifier | null
}

export const useKanban = (): Return => {
  const { taskStore, projectStore, folderStore } = useRootStore()
  const { updateAsync } = useTasks()
  const { filterTasks } = useFilterAndSortTaskFn()

  const [containers, setContainers] = useState<KanbanContainer[]>([])
  const [filledContainers, setFilledContainers] = useState<FilledContainers>({})

  const statuses = projectStore.activeProject.statuses
  const tasks = folderStore.activeFolder
    ? folderStore.activeFolder.rootTasks
    : taskStore.getRootTasks()
  const filteredTasks = filterTasks(tasks)

  const onItemPositionChange = () => {
    consoLER(`DND: Task not moved`)
  }

  const onContainerChange = (
    itemId: UniqueIdentifier,
    containerId: UniqueIdentifier
  ) => {
    consoLER(`DND: Task ${itemId} to status ${containerId}`)

    const task = taskStore.get(Number(itemId)) // check exists
    const status = projectStore.getStatusById(Number(containerId)) // check exists

    if (isExecution(task, status)) {
      return finishTransition(task)
    }

    if (isProcess(task, status)) {
      return processTransition(task, status)
    }

    changeStatusTransition(task, status)
  }

  function removeItemFromContainer(
    itemId: UniqueIdentifier,
    containerId: UniqueIdentifier
  ): void {
    setFilledContainers((prev) => ({
      ...prev,
      [containerId]: prev[containerId].filter((item) => item.id !== itemId)
    }))
  }

  function appendItemToContainer(
    itemId: UniqueIdentifier,
    containerId: UniqueIdentifier
  ) {
    setFilledContainers((prev) => {
      const updated = [{ id: itemId }, ...prev[containerId]]
      return {
        ...prev,
        [containerId]: updated
      }
    })
  }

  function appendContainer(containerId: UniqueIdentifier): void {
    setContainers((prev) => {
      return [...prev, containerId]
    })

    setFilledContainers((prev) => ({
      ...prev,
      [containerId]: []
    }))
  }

  function removeContainer(containerId: UniqueIdentifier): void {
    setContainers((prev) => prev.filter((c) => c !== containerId))
  }

  function duplicateContainer(tasks: Task[], status: ITaskStatus) {
    const containerId = mapContainer(status)
    setContainers((prev) => [...prev, containerId])
    setFilledContainers((prev) => ({
      ...prev,
      [containerId]: tasks.map((task) => mapItem(task))
    }))
  }

  function moveItems(
    fromContainer: KanbanContainer,
    toContainer: KanbanContainer
  ) {
    setFilledContainers((prev) => ({
      ...prev,
      [fromContainer]: [],
      [toContainer]: [...prev[toContainer], ...prev[fromContainer]]
    }))
  }

  const changeStatusTransition = (task: Task, status: ITaskStatus) =>
    startTransition(() => {
      updateAsync.mutateAsync({
        id: task.id,
        dto: {
          statusId: status.id
        }
      })
    })

  const finishTransition = (task: Task) =>
    startTransition(() => {
      TaskService.finish(task).then((dto) => taskStore.finish(dto, task))
    })

  const processTransition = (task: Task, status: ITaskStatus) =>
    startTransition(() => {
      TaskService.update({ id: task.id, dto: { statusId: status.id } }).then(
        () => taskStore.processed(task, status)
      )
    })

  const findContainer = (id: UniqueIdentifier) => {
    if (id in filledContainers) return id
    return Object.keys(filledContainers).find((key) =>
      filledContainers[key].some((item: any) => item.id === id)
    )
  }

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)

  const isColumnDrag = Boolean(activeId && !(activeId in filledContainers))

  const lastOverId = useRef<UniqueIdentifier | null>(null)

  const collisionDetectionStrategy: CollisionDetection = useCallback((args) => {
    const intersections = pointerWithin(args).length
      ? pointerWithin(args)
      : rectIntersection(args)

    const overId = getFirstCollision(intersections, 'id')

    if (overId) {
      lastOverId.current = overId
      return [{ id: overId }]
    }

    return lastOverId.current ? [{ id: lastOverId.current }] : []
  }, [])

  const onDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id)
  }

  const onDragOver = ({ over }: DragOverEvent) => {
    if (over?.id) lastOverId.current = over.id
  }

  const onDragEnd = ({ over, active }: DragEndEvent) => {
    setActiveId(null)
    if (!over) return

    if (active.id in filledContainers && over.id in filledContainers) {
      setContainers((c) =>
        arrayMove(c, c.indexOf(active.id), c.indexOf(over.id))
      )
      return
    }

    const activeContainer = findContainer(active.id)
    const overContainer = findContainer(over.id)

    if (!activeContainer || !overContainer) return

    if (activeContainer == overContainer) {
      return onItemPositionChange()
    }

    onContainerChange(active.id, overContainer)

    setFilledContainers((prev: any) => ({
      ...prev,
      [activeContainer]: prev[activeContainer].filter(
        (item: any) => item.id !== active.id
      ),
      [overContainer]: [{ id: active.id }, ...prev[overContainer]]
    }))
  }

  useEffect(() => {
    setContainers(mapContainers(statuses))
    setFilledContainers(mapFilledContainers(statuses, filteredTasks))
  }, [
    statuses.length,
    filteredTasks.length,
    getContainersChangeValue(filteredTasks)
  ])

  return {
    containers,
    filledContainers,
    removeItemFromContainer,
    appendItemToContainer,
    appendContainer,
    removeContainer,
    duplicateContainer,
    moveItems,
    collisionDetectionStrategy,
    onDragStart,
    onDragOver,
    onDragEnd,
    isColumnDrag,
    activeId
  }
}

function isExecution(task: Task, status: ITaskStatus) {
  return (
    task.status.code !== StatusCodes.EXECUTED &&
    status.code === StatusCodes.EXECUTED
  )
}

function isProcess(task: Task, status: ITaskStatus) {
  return (
    task.status.code === StatusCodes.EXECUTED &&
    status.code !== StatusCodes.EXECUTED
  )
}

function getContainersChangeValue(tasks: Task[]): string {
  const value = tasks.reduce((acc, current) => {
    if (acc[current.status.id]) {
      acc[current.status.id]++
    } else {
      acc[current.status.id] = 1
    }
    return acc
  }, {} as Record<number, number>)

  return JSON.stringify(value)
}
