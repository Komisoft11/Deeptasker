import { makeAutoObservable } from 'mobx'
import { ITag, ITaskStatus } from '@/entities/Project'
import {
  IProjectDto,
  IProjectSettings
} from '@/entities/Project/model/types/project.interface'
import { IUser } from '@/entities/User'
import { Workspace } from '@/entities/Workspace'

export class Project {
  private _dateCreated: Date
  private _id: number
  private _isFullyFetched: boolean
  private _taskCount: number
  private _folderCount: number
  private _order: number | null
  private _slug: string
  private _statuses: ITaskStatus[]
  private _tags: ITag[]
  private _title: string
  private _user: IUser
  private _dateArchived: Date | null
  private _dateDeleted: Date | null
  private _workspace: Workspace

  private readonly _uuid: string
  private readonly _dateUpdated: Date | null
  private readonly _iconBg: string
  private readonly _iconFg: string

  private _settings: IProjectSettings

  constructor(projectDTO: IProjectDto, ws: Workspace) {
    this._workspace = ws
    this._dateCreated = new Date(projectDTO.dateCreated)
    this._dateUpdated = projectDTO.dateUpdated
      ? new Date(projectDTO.dateUpdated)
      : null

    this._dateArchived = projectDTO.dateArchived
      ? new Date(projectDTO.dateArchived)
      : null

    this._iconBg = projectDTO.iconBg
    this._iconFg = projectDTO.iconFg
    this._id = projectDTO.id

    this._isFullyFetched = false

    this._order = projectDTO.order ? projectDTO.order : null

    this._slug = projectDTO.slug

    this._title = projectDTO.title

    this._uuid = projectDTO.uuid

    this._user = projectDTO.user ?? {}

    this._statuses = projectDTO.statuses ?? []

    this._tags = projectDTO.tags ?? []

    this._taskCount = projectDTO.taskCount ?? 0

    this._folderCount = projectDTO.folderCount

    this._dateDeleted = null

    this._settings = projectDTO.settings

    makeAutoObservable(this)
  }

  get workspace(): Workspace {
    return this._workspace
  }

  get user(): IUser {
    return this._user
  }

  set user(value: IUser) {
    this._user = value
  }

  get title(): string {
    return this._title
  }

  set title(value: string) {
    this._title = value
  }

  get tags(): ITag[] {
    return this._tags
  }

  set tags(value: ITag[]) {
    this._tags = value
  }

  get statuses(): ITaskStatus[] {
    return this._statuses
  }

  set statuses(value: ITaskStatus[]) {
    this._statuses = value
  }

  get slug(): string {
    return this._slug
  }

  set slug(value: string) {
    this._slug = value
  }

  get order(): number | null {
    return this._order
  }

  set order(value: number | null) {
    this._order = value
  }

  get taskCount(): number {
    return this._taskCount
  }

  set taskCount(value: number) {
    this._taskCount = value
  }

  get folderCount(): number {
    return this._folderCount
  }

  set folderCount(value: number) {
    this._folderCount = value
  }

  get isFullyFetched(): boolean {
    return this._isFullyFetched
  }

  set isFullyFetched(value: boolean) {
    this._isFullyFetched = value
  }

  get id(): number {
    return this._id
  }

  set id(value: number) {
    this._id = value
  }

  get dateDeleted(): Date | null {
    return this._dateDeleted
  }

  set dateDeleted(value: Date | null) {
    this._dateDeleted = value
  }

  get dateCreated(): Date {
    return this._dateCreated
  }

  set dateCreated(value: Date) {
    this._dateCreated = value
  }

  get dateArchived(): Date | null {
    return this._dateArchived
  }

  set dateArchived(value: Date | null) {
    this._dateArchived = value
  }

  get settings(): IProjectSettings {
    return this._settings
  }

  set settings(value: IProjectSettings) {
    this._settings = value
  }
}
