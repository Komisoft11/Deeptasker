import {IError} from '@/shared/api/api.helpers'
import {action, computed, makeObservable, observable} from 'mobx'

export class ErrorDialog {
  @observable private _error: IError | undefined = undefined
  @observable private _tryFunction: (() => void) | undefined = undefined
  @observable private _loading: boolean = false

  @computed get tryFunction(): (() => void) | undefined {
    return this._tryFunction
  }

  set tryFunction(value: (() => void) | undefined) {
    this._tryFunction = value
  }

  @computed get error(): IError | undefined {
    return this._error
  }

  set error(value: IError | undefined) {
    this._error = value
  }

  @computed get loading(): boolean {
    return this._loading
  }

  set loading(value: boolean) {
    this._loading = value
  }

  @action
  public clearError() {
    this._error = undefined
    this._tryFunction = undefined
    this._loading = false
  }

  constructor() {
    makeObservable(this)
  }
}
