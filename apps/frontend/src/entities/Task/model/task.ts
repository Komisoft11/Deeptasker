import { makeAutoObservable } from 'mobx'
import { ITag, ITaskStatus, Project } from '@/entities/Project'
import { IContent, TaskResponse } from '@/entities/Task'
import { TaskTimerHistoryResponse } from '@/entities/Task/model/types/task-response.interface'
import { ITaskComment } from '@/entities/TaskComment'
import { FileData } from '@/entities/TaskComment/model/types/task-comment.interface'
import { PriorityNumber1To6 } from '@/entities/TaskPlanner/model/types/task-planner.interface'
import { IUser } from '@/entities/User'
import { IObserver } from '@/entities/User/model/types/user.interface'
import { getRandomColor } from '@/shared/lib/helpers/color'

export class Task {
  private readonly _id: number
  private _activeDate: Date | null
  private _comments: ITaskComment[]
  private _contentObj: IContent
  private _dateFinished: Date | null
  private _executor: IUser | null
  private _files: FileData[]
  private _finishedByTaskId: number | null
  private _isCollapsed: boolean
  private _isFullyFetched: boolean
  private _order: number
  private _parent: Task | undefined
  private _priority: number
  private _project: Project
  private _projectId: number
  private _status: ITaskStatus
  private _subtasks: Task[]
  private _subtasksIds: number[]
  private _tags: ITag[]
  private _depth: number
  private _title: string
  private _isTrackingByOtherUser: boolean
  private _userSecondsTracked: number
  private _invited: IObserver[]
  private readonly _user: IUser
  private _parentId: number | undefined
  private _statusOrder: number
  private _assigner: IUser
  private readonly _childrenBg: string
  private readonly _dateCreated: Date
  private _deadlineDate: Date | null
  private _dateSentForReview: Date | null
  private _folderId: number | null
  private _timeHistory: TaskTimerHistoryResponse[]
  private _totalSecondsTacked: number
  private _planStartDate: Date | null
  private _estimatedTime: number | null
  private _commentsCount: number
  private _filesCount: number
  private readonly _priorityPlanner?: PriorityNumber1To6
  private _statusDateUpdated: Date | null
  private _sprintId: number | null
  private _externalId: string

  constructor(
    dto: TaskResponse,
    project: Project,
    status: ITaskStatus,
    currentUser: IUser
  ) {
    this._id = dto.id
    this._title = dto.title

    this._projectId = dto.projectId

    this._executor = dto.executor
    this._assigner = dto.assigner
    this._user = dto.user

    this._finishedByTaskId = dto.finishedByTaskId
    this._userSecondsTracked = 0

    this._dateCreated = new Date(dto.dateCreated)
    this._activeDate = dto.activeDate ? new Date(dto.activeDate) : null
    this._deadlineDate = dto.deadlineDate ? new Date(dto.deadlineDate) : null
    this._planStartDate = dto.planStartDate ? new Date(dto.planStartDate) : null
    this._dateFinished = dto.dateFinished ? new Date(dto.dateFinished) : null
    this._dateSentForReview = dto.dateSentForReview
      ? new Date(dto.dateSentForReview)
      : null

    this._contentObj = { currentState: dto.content ?? '', prevState: '' }
    this._priority = dto.priority
    this._project = project
    this._status = status
    this._tags = dto.tags ?? []
    this._totalSecondsTacked = 0
    this._estimatedTime = dto.estimatedTime ?? null
    this._commentsCount = dto.commentsCount ?? 0
    this._filesCount = dto.filesCount ?? 0

    this._folderId = dto.folderId

    this._sprintId = dto.sprintId

    this._externalId = dto.externalId

    this._invited = []
    this._commentsCount = dto.commentsCount
    this._comments = dto.comments ?? []
    this._files = dto.files ?? []
    this._timeHistory = dto.timeHistory ?? []

    this._isTrackingByOtherUser = Boolean(
      currentUser.id !== dto.executor?.id && dto.activeDate
    )

    this._childrenBg = getRandomColor()

    this._isFullyFetched = false

    this._priorityPlanner = Math.floor(
      Math.random() * 6 + 1
    ) as PriorityNumber1To6

    this._statusOrder = dto.statusOrder
    this.content = dto.content ?? ''

    this._subtasksIds = dto.subtasks

    this._statusDateUpdated = dto.statusDateUpdated
      ? new Date(dto.statusDateUpdated)
      : null

    //DEFAULT DND OPTIONS
    this._depth = 0
    this._isCollapsed = true
    this._subtasks = []
    this._parentId = dto.parentId
    this._order = dto.customOrder ?? 0

    makeAutoObservable(this)
  }

  get parentId(): number | undefined {
    return this._parentId
  }

  get depth(): number {
    if (!this._depth) {
      this._depth = 1 + (this.parent ? this.parent.depth : 0)
    }

    return this._depth
  }

  set depth(value: number) {
    this._depth = value
  }

  set subtasksIds(value: number[]) {
    this._subtasksIds = value
  }

  get subtasksIds(): number[] {
    return this._subtasksIds
  }

  get statusOrder(): number {
    return this._statusOrder
  }

  get priorityPlanner(): PriorityNumber1To6 | undefined {
    return this._priorityPlanner
  }

  get userSecondsTracked(): number {
    return this._userSecondsTracked
  }

  set userSecondsTracked(value: number) {
    this._userSecondsTracked = value
  }

  get user(): IUser {
    return this._user
  }

  get isTrackingByOtherUser(): boolean {
    return this._isTrackingByOtherUser
  }

  set isTrackingByOtherUser(value: boolean) {
    this._isTrackingByOtherUser = value
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

  get subtasks(): Task[] {
    return this._subtasks
  }

  set subtasks(value: Task[]) {
    this._subtasks = value
  }

  get parent(): Task | undefined {
    return this._parent
  }

  set totalSecondsTacked(value: number) {
    this._totalSecondsTacked = value
  }

  get totalSecondsTracked(): number {
    return this._totalSecondsTacked
  }

  set estimatedTime(value: number | null) {
    this._estimatedTime = value
  }

  get estimatedTime(): number | null {
    return this._estimatedTime
  }

  set parent(value: Task | undefined) {
    if (value) {
      this._parentId = value.id
    } else {
      this._parentId = undefined
    }

    this._parent = value
  }

  get status(): ITaskStatus {
    return this._status
  }

  set status(value: ITaskStatus) {
    this._status = value
  }

  get projectId(): number {
    return this._projectId
  }

  set projectId(value: number) {
    this._projectId = value
  }

  get project(): Project {
    return this._project
  }

  set project(value: Project) {
    this._project = value
  }

  get priority(): number {
    return this._priority
  }

  set priority(value: number) {
    this._priority = value
  }

  get order(): number {
    return this._order
  }

  set order(value: number) {
    this._order = value
  }

  get invited(): IObserver[] {
    return this._invited
  }

  set invited(value: IObserver[]) {
    this._invited = value
  }

  get timeHistory(): TaskTimerHistoryResponse[] {
    return this._timeHistory
  }

  set timeHistory(value: TaskTimerHistoryResponse[]) {
    this._timeHistory = value
  }

  get isFullyFetched(): boolean {
    return this._isFullyFetched
  }

  set isFullyFetched(value: boolean) {
    this._isFullyFetched = value
  }

  get isCollapsed(): boolean {
    return this._isCollapsed
  }

  set isCollapsed(value: boolean) {
    this._isCollapsed = value
  }

  get finishedByTaskId(): number | null {
    return this._finishedByTaskId
  }

  set finishedByTaskId(value: number | null) {
    this._finishedByTaskId = value
  }

  get files(): FileData[] {
    return this._files
  }

  set files(value: FileData[]) {
    this._files = value
  }

  get executor(): IUser | null {
    return this._executor
  }

  set executor(value: IUser | null) {
    this._executor = value
  }

  set deadlineDate(value: Date | null) {
    this._deadlineDate = value
  }

  get deadlineDate(): Date | null {
    return this._deadlineDate
  }

  set planStartDate(value: Date | null) {
    this._planStartDate = value
  }

  get planStartDate(): Date | null {
    return this._planStartDate
  }

  get dateFinished(): Date | null {
    return this._dateFinished
  }

  set dateFinished(value: Date | null) {
    this._dateFinished = value
  }

  get dateCreated(): Date {
    return this._dateCreated
  }

  set dateSentForReview(value: Date | null) {
    this._dateSentForReview = value
  }

  get dateSentForReview(): Date | null {
    return this._dateSentForReview
  }

  get commentsCount(): number {
    return this._commentsCount
  }

  set commentsCount(value: number) {
    this._commentsCount = value
  }

  get filesCount(): number {
    return this._filesCount
  }

  set filesCount(value: number) {
    this._filesCount = value
  }

  get comments(): ITaskComment[] {
    return this._comments
  }

  set comments(value: ITaskComment[]) {
    this._comments = value
  }

  get assigner(): IUser {
    return this._assigner
  }

  set assigner(value: IUser) {
    this._assigner = value
  }

  get activeDate(): Date | null {
    return this._activeDate
  }

  set activeDate(value: Date | null) {
    this._activeDate = value
  }

  get folderId(): number | null {
    return this._folderId
  }

  set folderId(value: number | null) {
    this._folderId = value
  }

  get id(): number {
    return this._id
  }

  set content(value: string) {
    this._contentObj = {
      prevState: this._contentObj.currentState,
      currentState: value
    }
  }

  get content(): string {
    return this._contentObj.currentState
  }

  get hasChildren(): boolean {
    return !!this.subtasks.length
  }

  set statusOrder(value: number) {
    this._statusOrder = value
  }

  get sprintId(): number | null {
    return this._sprintId
  }

  set sprintId(value: number | null) {
    this._sprintId = value
  }

  get externalId(): string {
    return this._externalId
  }

  get isOverdue(): boolean {
    return !!(
      this.dateFinished === null &&
      this.deadlineDate &&
      this.deadlineDate <= new Date()
    )
  }

  get statusDateUpdated() {
    return this._statusDateUpdated
  }

  removeSubtask(id: number) {
    this.subtasks = this.subtasks.filter((task) => task.id !== id)
  }

  getBaseSorted() {
    return this.subtasks.slice().sort((a, b) => a.order - b.order)
  }
}
