import { makeAutoObservable } from 'mobx'
import { Project, ProjectStore } from '@/entities/Project'
import {
  ISprintDTO,
  SprintStatuses
} from '@/entities/Sprint/model/types/sprint.types'
import { Task, TaskStore } from '@/entities/Task'
import { IUser } from '@/entities/User'


export class Sprint {
  private readonly _id: number
  private _title: string
  private _description: string | null
  private _dateStart: Date
  private _dateEnd: Date
  private _user: IUser
  private _project: Project
  private _status: SprintStatuses
  private _tasks: Task[]

  constructor(
    dto: ISprintDTO,
    taskStore: TaskStore,
    projectStore: ProjectStore
  ) {
    this._id = dto.id
    this._title = dto.title
    this._description = dto.description || null
    this._dateStart = new Date(dto.dateStart)
    this._dateEnd = new Date(dto.dateEnd)
    this._project = projectStore.get(dto.projectId)
    this._user = dto.user
    this._status = dto.status
    this._tasks = dto.taskIds.length
      ? dto.taskIds.map((id) => taskStore.get(id))
      : []

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

  get description(): string | null {
    return this._description
  }

  set description(value: string) {
    this._description = value
  }

  get dateStart(): Date {
    return this._dateStart
  }

  set dateStart(value: Date) {
    this._dateStart = value
  }

  get dateEnd(): Date {
    return this._dateEnd
  }

  set dateEnd(value: Date) {
    this._dateEnd = value
  }

  get project(): Project {
    return this._project
  }

  set project(value: Project) {
    this._project = value
  }

  get status(): SprintStatuses {
    return this._status
  }

  set status(value: SprintStatuses) {
    this._status = value
  }

  get tasks(): Task[] {
    return this._tasks
  }

  set tasks(value: Task[]) {
    this._tasks = value
  }

  get user(): IUser {
    return this._user
  }

  set user(value: IUser) {
    this._user = value
  }
}
