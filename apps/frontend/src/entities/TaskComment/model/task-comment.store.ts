import { makeAutoObservable } from 'mobx'
import { ITaskComment } from '@/entities/TaskComment'

export class TaskCommentStore {
  private _editTaskComment?: ITaskComment
  private _isEditTaskComment: boolean = false

  constructor() {
    makeAutoObservable(this)
  }

  get editTaskComment(): ITaskComment | undefined {
    return this._editTaskComment
  }

  set editTaskComment(value: ITaskComment | undefined) {
    this._editTaskComment = value
  }

  get isEditTaskComment(): boolean {
    return this._isEditTaskComment
  }

  set isEditTaskComment(value: boolean) {
    this._isEditTaskComment = value
  }

  clear() {
    this._editTaskComment = undefined
    this._isEditTaskComment = false
  }
}
