import { makeAutoObservable } from 'mobx'
import { IFolderDTO } from '@/entities/Folder'
import { Project } from '@/entities/Project'
import { Task } from '@/entities/Task'
import { IUser } from '@/entities/User'

export class Folder {
  private readonly _id: number
  private _title: string
  private _order: number
  private _parentId: number | null
  private _subFolders: Folder[]
  private _project: Project
  private _tasks: Task[]
  private readonly _user: IUser
  private readonly _dateCreated: Date
  private _dateUpdated: Date | null
  private _subFoldersIds: number[] = []
  private _parent: Folder | undefined

  constructor(dto: IFolderDTO, tasks: Task[], project: Project) {
    this._id = dto.id
    this._title = dto.title
    this._dateCreated = new Date(dto.dateCreated)
    this._dateUpdated = dto.dateUpdated ? new Date(dto.dateUpdated) : null
    this._order = dto.customOrder
    this._parentId = dto.parentId ?? null
    this._project = project
    this._user = dto.user
    this._tasks = tasks
    this._subFoldersIds = dto.subFolderIds
    this._subFolders = []
    this._parent = undefined
    makeAutoObservable(this)
  }

  get id(): number {
    return this._id
  }

  get title(): string {
    return this._title
  }

  set title(value: string) {
    this._title = value
  }

  get order(): number {
    return this._order
  }

  set order(value: number) {
    this._order = value
  }

  get parentId(): number | null {
    return this._parentId
  }

  set parentId(value: number | null) {
    this._parentId = value
  }

  get project(): Project {
    return this._project
  }

  set project(value: Project) {
    this._project = value
  }

  get tasks(): Task[] {
    return this._tasks
  }

  set tasks(value: Task[]) {
    this._tasks = value
  }

  get subFolders(): Folder[] {
    return this._subFolders
  }

  set subFolders(value: Folder[]) {
    this._subFolders = value
  }

  get rootTasks(): Task[] {
    return this._tasks.filter((task) => !task.parentId)
  }

  get user(): IUser {
    return this._user
  }

  get dateCreated(): Date {
    return this._dateCreated
  }

  get dateUpdated(): Date | null {
    return this._dateUpdated
  }

  set dateUpdated(value: Date | null) {
    this._dateUpdated = value
  }

  get parent(): Folder | undefined {
    return this._parent
  }

  set parent(value: Folder | undefined) {
    this._parent = value
  }

  get subFoldersIds(): number[] {
    return this._subFoldersIds
  }

  get hasSubFolders(): boolean {
    return !!this._subFolders.length
  }

  get hasTasks(): boolean {
    return !!this._tasks.length
  }
}
