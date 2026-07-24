import { makeAutoObservable } from 'mobx'
import { IUser } from '@/entities/User'
import { IWorkspaceDTO } from '@/entities/Workspace'
import { USER_ROLE_MEMBER } from '@/entities/Workspace/const/userRoles'
import { IUSerRole } from '@/entities/Workspace/model/types/workspace.interface'


export class Workspace {
  private readonly _id: number
  private _title: string
  private _projectCount: number
  private _archivedProjectCount: number
  private _dateCreated: Date
  private _members: IUser[]
  private _userRole: IUSerRole
  private _isFetchMembers: boolean = false
  private readonly _user: IUser

  constructor(dto: IWorkspaceDTO) {
    this._id = dto.id
    this._title = dto.title

    this._projectCount = dto.projectCount
    this._dateCreated = new Date(dto.dateCreated)
    this._archivedProjectCount = dto.archivedProjectCount

    this._user = dto.user
    this._members = dto.members ?? []
    this._userRole = dto.userRole ?? USER_ROLE_MEMBER

    makeAutoObservable(this)
  }

  get id() {
    return this._id
  }

  get user() {
    return this._user
  }

  get userRole() {
    return this._userRole
  }

  set title(value: string) {
    this._title = value
  }

  get title() {
    return this._title
  }

  set members(value: IUser[]) {
    this._members = value
  }

  get members() {
    return this._members
  }

  set projectCount(value: number) {
    this._projectCount = value
  }

  get projectCount() {
    return this._projectCount
  }

  set archivedProjectCount(value: number) {
    this._archivedProjectCount = value
  }

  get archivedProjectCount() {
    return this._archivedProjectCount
  }

  get isFetchMembers(): boolean {
    return this._isFetchMembers
  }

  set isFetchMembers(value: boolean) {
    this._isFetchMembers = value
  }

  get dateCreated(): Date {
    return this._dateCreated
  }
}
