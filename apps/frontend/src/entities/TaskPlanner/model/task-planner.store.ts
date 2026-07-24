import { makeAutoObservable } from 'mobx'
import { CardSize } from '@/entities/TaskPlanner'
import { ViewTabs, viewTabs } from '@/shared/config/route.config'

export class TaskPlannerStore {
  private _cardSize: CardSize = 'L' as CardSize
  private _view: ViewTabs = viewTabs.TABLE

  constructor() {
    makeAutoObservable(this)
  }

  get cardSize() {
    return this._cardSize
  }

  set cardSize(value: CardSize) {
    this._cardSize = value
    localStorage.setItem('cardSize', value)
  }

  get view() {
    return this._view
  }

  set view(value: ViewTabs) {
    this._view = value
  }
}
