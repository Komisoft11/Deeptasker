import { Task } from '@/entities/Task'
import { TaskFilterStore } from '@/entities/TaskFilter'
import { FilterHelper } from '@/shared/lib/helpers/filter.helper'


const { multiPropertySort } = FilterHelper

export class TaskReturner {
  public static renderRootWithSort(rootProjects: Task[]): Task[] {
    return this.sortTasks(rootProjects)
  }

  private static sortTasks(tasks: Task[]): Task[] {
    const defaultSorters = TaskFilterStore.DEFAULT_SORTER
    const keys = TaskFilterStore.getKeysForMultiSort<Task>(defaultSorters)
    return tasks.slice().sort(multiPropertySort<Task>(...keys))
  }
}
