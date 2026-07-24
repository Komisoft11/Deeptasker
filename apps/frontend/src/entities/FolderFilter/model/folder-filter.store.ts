import { makeAutoObservable } from 'mobx'
import { Folder } from '@/entities/Folder'
import { FilterName } from '@/entities/FolderFilter'
import { IFilter, ISorter } from '@/shared/lib/helpers/filter.helper'

export class FolderFilterStore {
  static DEFAULT_SORTER: ISorter<Folder> = {
    property: 'dateCreated',
    sort: 'desc'
  }

  private _queryFolder: string = ''
  private _activeFilters: IFilter<Folder, any, FilterName>[] = []
  private _activeSorter: ISorter<Folder> = FolderFilterStore.DEFAULT_SORTER
  constructor() {
    makeAutoObservable(this)
  }

  get queryFolder(): string {
    return this._queryFolder
  }

  set queryFolder(value: string) {
    this._queryFolder = value
  }

  get activeSorter(): ISorter<Folder> {
    return this._activeSorter
  }

  clear() {
    this._queryFolder = ''
  }
}
