import {
  FilledContainers,
  KanbanContainer,
  KanbanItem
} from '@/widgets/KanbanPlanner/types/KanbanItem.interface'
import { ITaskStatus } from '@/entities/Project'
import { Task } from '@/entities/Task'

export function mapItem(task: Task): KanbanItem {
  return { id: task.id }
}

export function mapContainer(taskStatus: ITaskStatus): KanbanContainer {
  return taskStatus.id
}

export function mapContainers(statuses: ITaskStatus[]): KanbanContainer[] {
  return baseContainers(statuses.map(mapContainer))
}

export function mapFilledContainers(
  statuses: ITaskStatus[],
  tasks: Task[]
): FilledContainers {
  const filledContainers: FilledContainers = {}

  const emptyContainers = mapContainers(statuses)

  emptyContainers.forEach((container) => {
    filledContainers[container] = []
  })

  tasks.forEach((task) => {
    const container = mapContainer(task.status)
    const item = mapItem(task)
    filledContainers[container]?.push(item)
  })

  return filledContainers
}

function baseContainers(statuses: KanbanContainer[]): KanbanContainer[] {
  return statuses.sort((a, b) => Number(a) - Number(b))
}
