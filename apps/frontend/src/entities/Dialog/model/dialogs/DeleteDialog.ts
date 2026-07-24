import { makeAutoObservable } from 'mobx'
import { ReactNode } from 'react'

export class DeleteDialog {
  private _title: ReactNode | undefined = undefined
  private _body: ReactNode | undefined = undefined
  private _deleteFunction: (() => Promise<void>) | undefined = undefined
  private _loading: boolean = false
  private _buttonText: ReactNode | undefined = undefined

  constructor() {
    makeAutoObservable(this)
  }

  get title(): ReactNode | undefined {
    return this._title
  }

  set title(value: ReactNode | undefined) {
    this._title = value
  }

  get buttonText(): ReactNode | undefined {
    return this._buttonText
  }

  set buttonText(value: ReactNode | undefined) {
    this._buttonText = value
  }

  get deleteFunction(): (() => Promise<void>) | undefined {
    return this._deleteFunction
  }

  set deleteFunction(value: (() => Promise<void>) | undefined) {
    this._deleteFunction = value
  }

  get body(): ReactNode | undefined {
    return this._body
  }

  set body(value: ReactNode | undefined) {
    this._body = value
  }

  get loading(): boolean {
    return this._loading
  }

  set loading(value: boolean) {
    this._loading = value
  }

  public clear() {
    this._title = undefined
    this._buttonText = undefined
    this._body = undefined
    this._deleteFunction = undefined
    this._loading = false
  }
}
