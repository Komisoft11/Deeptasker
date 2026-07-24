import { Task } from '@/entities/Task'

export const getAllChildrenIds = (
  rootId: number,
  allTasks: Task[]
): number[] => {
  const children = allTasks.filter((t) => t.parentId === rootId)
  let ids: number[] = children.map((c) => c.id)

  for (const child of children) {
    ids = [...ids, ...getAllChildrenIds(child.id, allTasks)]
  }

  return ids
}