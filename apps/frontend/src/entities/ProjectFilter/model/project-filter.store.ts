import { makeAutoObservable } from 'mobx'

export class ProjectFilterStore {
  private _queryProject: string = ''

  constructor() {
    makeAutoObservable(this)
  }

  get queryProject(): string {
    return this._queryProject
  }

  set queryProject(value: string) {
    this._queryProject = value
  }

  clear() {
    this._queryProject = ''
  }
}
