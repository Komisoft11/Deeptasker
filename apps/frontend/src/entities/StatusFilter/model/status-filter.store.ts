import { makeAutoObservable } from 'mobx'
import { KanbanSorterType } from '@/widgets/KanbanPlanner/ui/AdditionalActionsPopover/ui/SortingDropdown/SortingDropdown'
import { ProjectStore } from '@/entities/Project'
import { Task } from '@/entities/Task'
import { SortOrder, StatusSorters } from '@/shared/lib/helpers/filter.helper'
import { isEmpty } from '@/shared/lib/helpers/main.helper'

export class StatusFilterStore {
  private _activeSorters: StatusSorters<Task> = {}
  private readonly _projectStore: ProjectStore

  constructor(projectStore: ProjectStore) {
    makeAutoObservable(this)
    this._projectStore = projectStore
  }

  get activeSorters() {
    return this._activeSorters
  }

  public init() {
    if (isEmpty(this._projectStore.activeProject)) {
      return
    }

    if (!this._projectStore.activeProject?.statuses.length) {
      return
    }

    const statuses = this._projectStore.activeProject.statuses

    statuses.forEach((status) => {
      this.setSorters(status.id, KanbanSorterType.DateCreated)
    })
  }

  public setSorters(
    statusId: number,
    type: KanbanSorterType,
    sort: SortOrder = 'asc'
  ): void {
    this._activeSorters[statusId] = {
      property: type,
      sort: sort
    }
  }

  public clear() {
    this._activeSorters = {}
  }
}
