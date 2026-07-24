import dayjs from 'dayjs'
import { makeAutoObservable } from 'mobx'
import {
  BooleanFilterKeys,
  DateFilterKeys,
  Task,
  UnifiedFilterKeys,
  booleanFilterKeys,
  dateFilterKeys,
  filterMap,
  idFilterKeys,
  propertyDateMap
} from '@/entities/Task'
import { FilterName } from '@/entities/TaskFilter'
import { DATE_FORMAT } from '@/shared/const/date_format'
import { todayDate } from '@/shared/lib/helpers/date.helper'
import { IFilter, ISorter, SortOrder } from '@/shared/lib/helpers/filter.helper'
import {
  LocalStorageItems,
  getStoreLocal
} from '@/shared/lib/helpers/local-storage.helper'
import { DateRange } from '@/shared/types/time.interface'

export class TaskFilterStore {
  static DEFAULT_SORTER: ISorter<Task>[] = [
    {
      property: 'order',
      sort: 'asc'
    }
  ]

  private _queryTask: string = ''
  private _isShowFind: boolean = false
  private _activeFilters: IFilter<Task, any, FilterName>[] = []
  private _activeSorters: ISorter<Task>[] = TaskFilterStore.DEFAULT_SORTER

  get activeSorters(): ISorter<Task>[] {
    return this._activeSorters
  }

  get isShowFind(): boolean {
    return this._isShowFind
  }

  set isShowFind(value: boolean) {
    if (value) {
      localStorage.setItem(LocalStorageItems.showSearch, 'true')
    } else {
      localStorage.removeItem(LocalStorageItems.showSearch)
    }
    this._isShowFind = value
  }

  set activeSorters(value: ISorter<Task>[]) {
    this._activeSorters = value
  }

  get activeFilters(): IFilter<Task, any, FilterName>[] {
    return this._activeFilters
  }

  get activeFiltersMap() {
    return {
      creation:
        (this.getActiveFilterByName('CREATION_DATE_FILTER')
          ?.data as DateRange) ?? null,
      finish:
        (this.getActiveFilterByName('FINISH_DATE_FILTER')?.data as DateRange) ??
        null,
      deadline:
        (this.getActiveFilterByName('DEADLINE_DATE_FILTER')
          ?.data as DateRange) ?? null,
      isOverdue: !!this.getActiveFilterByName('IS_OVERDUE_FILTER')?.data,
      assigner: Object.values(
        this.getActiveFilterByName('ASSIGNER_FILTER')?.data ?? {}
      ),
      executor: Object.values(
        this.getActiveFilterByName('EXECUTOR_FILTER')?.data ?? {}
      ),
      status: Object.values(
        this.getActiveFilterByName('STATUS_FILTER')?.data ?? {}
      ),
      priority: Object.values(
        this.getActiveFilterByName('PRIORITY_FILTER')?.data ?? {}
      ),
      tags: Object.values(
        this.getActiveFilterByName('TAGS_FILTER')?.data ?? {}
      ),
      folderId: Object.values(
        this.getActiveFilterByName<number[]>('FOLDER_FILTER')?.data ?? {}
      ),
      sprintId: Object.values(
        this.getActiveFilterByName<number[]>('SPRINT_FILTER')?.data ?? {}
      )
    }
  }

  getActiveFiltersWithoutFocusMode(): IFilter<Task, any, FilterName>[] {
    return this._activeFilters.filter(
      (filter) => filter.filterName !== 'MODE_FOCUS_FILTER'
    )
  }

  removeActiveFiltersByNames(names: FilterName[]): void {
    this._activeFilters = this._activeFilters.filter(
      (filter) => !names.includes(filter.filterName)
    )
  }

  addActiveFilter<Data>(filter: IFilter<Task, Data, FilterName>) {
    this._activeFilters.push(filter)
  }

  getActiveFilterByName<Data>(
    filterName: FilterName
  ): IFilter<Task, Data, FilterName> | undefined {
    return this._activeFilters.find(
      (filter) => filter.filterName === filterName
    )
  }

  removeActiveFilterByProperty(filterName: FilterName) {
    this._activeFilters = this._activeFilters.filter(
      (filter) => filter.filterName !== filterName
    )
  }

  get queryTask(): string {
    return this._queryTask
  }

  set queryTask(value: string) {
    this._queryTask = value
  }

  constructor() {
    makeAutoObservable(this)
    this._isShowFind = getStoreLocal<boolean>(LocalStorageItems.showSearch)
  }

  public async init(filters: URLSearchParams) {
    this.clear()

    if (!filters.size) {
      return
    }

    dateFilterKeys.forEach((key) => {
      const value = filters.get(key)

      if (!value) {
        return
      }

      const range = value.split(' ') ?? []

      const dateFrom = dayjs(range[0], DATE_FORMAT).toDate() ?? null
      const dateTo = dayjs(range[1], DATE_FORMAT).toDate() ?? null

      if (dateFrom && dateTo) {
        if (dayjs(dateFrom).isValid() && dayjs(dateTo).isValid()) {
          this.setRangeDateFilter(key, [dateFrom, dateTo])
        }
      } else {
        const dateValue = dayjs(value, DATE_FORMAT).toDate()
        if (dayjs(dateValue).isValid()) {
          this.setDateFilter(key, dateValue)
        }
      }
    })

    idFilterKeys.forEach((key) => {
      const values = filters.getAll(key)
      if (values.length > 0) {
        const numbers = values.map(Number).filter((num) => !isNaN(num))
        if (numbers.length > 0) {
          this.setIdFilter(key, numbers)
        }
      }
    })

    booleanFilterKeys.forEach((key) => {
      const value = filters.get(key)
      if (value !== null) {
        const boolValue = value === 'true'
        this.setBooleanFilter(key, boolValue)
      }
    })
  }

  public clear() {
    this._queryTask = ''
    this._isShowFind = false
    this._activeFilters = []
    this._activeSorters = TaskFilterStore.DEFAULT_SORTER
  }

  public static getKeysForMultiSort<T>(
    sorters: ISorter<T>[]
  ): Array<[keyof T, SortOrder]> {
    return sorters.map((aF) => Object.values(aF) as [keyof T, SortOrder])
  }

  public setDateFilter(key: DateFilterKeys, value: Date) {
    const filterName = filterMap[key]
    const propertyName = propertyDateMap[key]
    const isFromDate = key.includes('From')

    this.addActiveFilter({
      data: value,
      cb: (task: Task) => {
        const taskDate = task[propertyName]
        if (!taskDate) return false

        return isFromDate ? taskDate >= value : taskDate <= value
      },
      filterName
    })
  }

  public setRangeDateFilter(key: DateFilterKeys, value: [Date, Date]) {
    const filterName = filterMap[key]
    const propertyName = propertyDateMap[key]

    this.addActiveFilter({
      data: value,
      cb: (task: Task) => {
        const taskDate = task[propertyName]
        if (!taskDate) {
          return false
        }

        return taskDate >= value[0] && taskDate <= value[1]
      },
      filterName
    })
  }

  public setIdFilter(key: UnifiedFilterKeys, value: unknown[]) {
    const filterName = filterMap[key]

    this.addActiveFilter({
      data: value,
      cb: (task: Task) => {
        if (!task[key] && task.priority !== 0) {
          return false
        }

        switch (key) {
          case 'tags':
            return task.tags.some((tag) => value.includes(tag.id))
          case 'priority':
          case 'folderId':
          case 'sprintId':
            return value.includes(task[key])
          case 'executor':
            return task.executor ? value.includes(task.executor.id) : false
          case 'assigner':
          case 'status':
            return value.includes(task[key].id)
          default:
            return false
        }
      },
      filterName
    })
  }

  public setBooleanFilter(key: BooleanFilterKeys, value: boolean) {
    if (value) {
      const filterName = filterMap[key]

      this.addActiveFilter({
        data: value,
        cb: (task: Task) => {
          if (key === 'isOverdue') {
            return task.deadlineDate ? task.deadlineDate < todayDate : false
          }
          return false
        },
        filterName
      })
    }
  }
}
