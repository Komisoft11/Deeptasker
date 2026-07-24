import { UniqueIdentifier } from '@dnd-kit/core'
import { QueryClient } from '@tanstack/query-core'
import dayjs from 'dayjs'
import { makeAutoObservable, runInAction } from 'mobx'
import { calculateTimeDifferenceInSeconds } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/TimeTab/helpers/calculateTimeDifference'
import { FileService } from '@/entities/File/services/file.service'
import { ITag, ITaskStatus, Project, ProjectStore } from '@/entities/Project'
import {
  IDuplicateStatusDTO,
  TaskStatusCodeDefault
} from '@/entities/Project/model/types/project.interface'
import { ProjectService } from '@/entities/Project/services/project.service'
import {
  AssignObserverRequest,
  AssignUserRequest,
  ExtendedTaskResponse,
  FinishTaskResponse,
  MoveTaskRequest,
  Task,
  TaskChangeFolderRequest,
  TaskChangeProjectRequest,
  TaskCreateRequest,
  TaskResponse,
  TaskService,
  TaskUpdateFieldsRequest,
  TrackingTaskResponse
} from '@/entities/Task'
import { TaskTimerHistoryResponse } from '@/entities/Task/model/types/task-response.interface'
import { FileData } from '@/entities/TaskComment/model/types/task-comment.interface'
import { TaskFilterStore } from '@/entities/TaskFilter'
import { AuthStore, IUser } from '@/entities/User'
import { IObserver } from '@/entities/User/model/types/user.interface'
import { queries } from '@/entities/lib/api/all-queries'
import { FilterHelper } from '@/shared/lib/helpers/filter.helper'
import { LocalStorageHelper } from '@/shared/lib/helpers/local-storage.helper'
import { isEmpty } from '@/shared/lib/helpers/main.helper'

export class TaskStore {
  private _loading: boolean = false
  private _tasks: Task[] = []
  private _activeTask: Task | undefined
  private _trackingTask: Task = {} as Task
  private _mapTasks: Map<number, Task> = new Map<number, Task>()
  private _mapExternalIds: Map<string, number> = new Map<string, number>()
  private _finishedTasks: Task[] = []
  private readonly _projectStore: ProjectStore
  private readonly _authStore: AuthStore
  private readonly _ql: QueryClient

  constructor(
    projectStore: ProjectStore,
    authStore: AuthStore,
    ql: QueryClient
  ) {
    makeAutoObservable(this, undefined, { autoBind: true })

    this._ql = ql
    this._projectStore = projectStore
    this._authStore = authStore
  }

  get safeActiveTask(): Task | undefined {
    return this._activeTask
  }

  get activeTask(): Task {
    if (!this._activeTask) {
      throw new Error('Not set active task in Store')
    }
    return this._activeTask
  }

  set activeTask(value: Task | undefined) {
    this._activeTask = value
  }

  get loading(): boolean {
    return this._loading
  }

  set loading(value: boolean) {
    this._loading = value
  }

  get tasks(): Task[] {
    return this._tasks
  }

  get trackingTask(): Task {
    return this._trackingTask
  }

  set trackingTask(value: Task) {
    this._trackingTask = value
  }

  get activeProject(): Project {
    return this._projectStore.activeProject
  }

  get finishedTasks(): Task[] {
    return this._finishedTasks
  }

  public async init(signal?: AbortSignal): Promise<void> {
    if (!this._projectStore.projects.length) {
      return
    }

    runInAction(() => {
      this._finishedTasks = []
      this._tasks = []
      this._mapTasks.clear()
      this.activeTask = undefined
      this._trackingTask = {} as Task
    })

    if (isEmpty(this._projectStore.activeProject)) {
      return
    }

    this.loading = true

    const tasksDTOs = await this.fetchTasksByProject(signal)
    const trackingTaskDTO = await this.fetchTrackingTask()

    runInAction(() => {
      this._tasks = this.mapperTasks(tasksDTOs)
    })

    if (trackingTaskDTO) {
      this.trackingTask = await this.mapTrackingTaskDTOToTask(trackingTaskDTO)
    }

    this.loading = false
  }

  public async create(
    id: number,
    dateCreated: string,
    externalId: string,
    taskCreateDTO: TaskCreateRequest
  ): Promise<Task> {
    const activeProject = this._projectStore.activeProject

    const users = await this._ql.fetchQuery(
      queries.project.members(activeProject, activeProject.workspace.id)
    )

    const executor = taskCreateDTO.executorId
      ? users.find((m) => m.id === taskCreateDTO.executorId)
      : undefined

    const defaultOpenStatus = this.activeProject.statuses.find(
      (s) => s.code === TaskStatusCodeDefault.open
    )

    const status = taskCreateDTO.statusId
      ? this._projectStore.getStatusById(taskCreateDTO.statusId)
      : defaultOpenStatus

    const content = taskCreateDTO.content ?? ''

    const deadline = taskCreateDTO.deadlineDate
      ? dayjs(taskCreateDTO.deadlineDate).format('YYYY-MM-DD, HH:mm:ss')
      : null

    const priority = taskCreateDTO.priority ?? 0

    if (!status) {
      throw new Error('not found open status for project: ' + activeProject.id)
    }

    const currentUser = LocalStorageHelper.getUser()

    const task = new Task(
      {
        id,
        title: taskCreateDTO.title,
        assigner: currentUser,
        projectId: taskCreateDTO.projectId,
        parentId: taskCreateDTO.parentId,
        subtasks: [],
        commentsCount: 0,
        filesCount: 0,
        statusId: status.id,
        user: currentUser,
        executor: executor ?? null,
        finishedByTaskId: null,
        priority: priority,
        dateFinished: null,
        activeDate: null,
        deadlineDate: deadline,
        dateCreated: dateCreated,
        dateUpdated: null,
        files: [],
        customOrder: 1,
        tags:
          activeProject.tags.filter((tag) =>
            taskCreateDTO.tags?.includes(tag.id)
          ) ?? [],
        comments: [],
        content: content,
        statusOrder: 1,
        estimatedTime: null,
        planStartDate: null,
        timeHistory: [],
        dateSentForReview: null,
        folderId: taskCreateDTO.folderId ?? null,
        statusDateUpdated: null,
        sprintId: taskCreateDTO.sprintId ?? null,
        externalId: externalId
      },
      this._projectStore.get(taskCreateDTO.projectId),
      status,
      currentUser
    )

    task.isTrackingByOtherUser = false
    task.isFullyFetched = true

    this.addTask(task)

    const proxyTask = this.get(id)

    if (taskCreateDTO.parentId) {
      proxyTask.parent = this.get(taskCreateDTO.parentId)

      this.addSubtask(taskCreateDTO.parentId, proxyTask)
      if (proxyTask.parent.sprintId) {
        proxyTask.sprintId = proxyTask.parent.sprintId
      }
    }

    return proxyTask
  }

  public update(taskUpdateFields: TaskUpdateFieldsRequest) {
    const task = this.get(taskUpdateFields.id)

    if (taskUpdateFields.dto.sprintId !== undefined) {
      this.updateSubtasksSprint(taskUpdateFields.dto.sprintId, task)
    }

    runInAction(() => {
      Object.assign(task, taskUpdateFields.dto)
    })

    if (taskUpdateFields.dto?.statusId) {
      const status = this._projectStore.getStatusById(
        taskUpdateFields.dto.statusId
      )
      this.updateStatus(task, status)
    }

    this._tasks = this.tasks.map((t) => {
      if (t.id === task.id) {
        return task
      }

      return t
    })
  }

  public move(data: MoveTaskRequest): void {
    const mainTask = this.get(data.taskId)

    if (data.taskFromId) {
      const taskFrom = this.get(data.taskFromId as number)
      mainTask.parent = undefined
      mainTask.depth = 0
      taskFrom.subtasks = taskFrom.subtasks.filter((t) => t.id !== mainTask.id)
    }

    if (data.taskToId) {
      const taskTo = this.get(data.taskToId as number)
      taskTo.subtasks.push(mainTask)
      mainTask.parent = taskTo
      mainTask.depth = taskTo.depth + 1
    }
  }

  public finish(dto: FinishTaskResponse, task: Task): void {
    const executedStatus = this._projectStore.activeProject.statuses.find(
      (s) => s.code === TaskStatusCodeDefault.executed
    )

    if (!executedStatus) {
      throw new Error('Not found execute status')
    }

    this.updateStatus(task, executedStatus)

    runInAction(() => {
      task.dateFinished = dto.finishedAt
      task.finishedByTaskId = task.id ?? null

      this._finishedTasks.push(task)

      if (isEmpty(task.executor)) {
        task.executor = this._authStore.user
      }
    })

    // FINISH SUBTASKS
    if (!isEmpty(task.subtasks)) {
      this.finishSubtask(task)
    }
  }

  public processed(task: Task, status?: ITaskStatus): void {
    const processedStatus = this._projectStore.activeProject.statuses.find(
      (s) => s.code === TaskStatusCodeDefault.process
    )
    if (!processedStatus) {
      throw new Error('Not found processed status')
    }

    this.updateStatus(task, status ?? processedStatus)

    runInAction(() => {
      task.finishedByTaskId = null
      task.dateFinished = null
      this._finishedTasks = this._finishedTasks.filter((t) => t.id !== task.id)
    })
  }

  public delete(task: Task): void {
    const project = this._projectStore.get(task.projectId)

    runInAction(() => {
      project.taskCount -= this.getLengthOfTree(task) + 1
    })

    this.deleteFromParent(task)

    if (task.subtasks.length) {
      this.deleteSubtasks(task)
    }

    this.deleteFromStore(task)
  }

  public changeProject({
    changedProject,
    task,
    mainProject
  }: TaskChangeProjectRequest): void {
    this.deleteFromStore(task)
    this.deleteSubtasks(task)

    runInAction(() => {
      task.project = changedProject
      task.projectId = changedProject.id
      changedProject.taskCount =
        changedProject.taskCount + this.getLengthOfTree(task) + 1
      mainProject.taskCount =
        mainProject.taskCount - this.getLengthOfTree(task) - 1
    })
  }

  public changeFolder(dto: TaskChangeFolderRequest): void {
    const task = this.get(dto.taskId)

    if (task.parent) {
      this.deleteFromParent(task)
    }

    runInAction(() => {
      task.folderId = dto.folderId
      task.depth = 1
    })

    this.changeSubtaskFolder(task)
  }

  public removeFolder(taskId: number): void {
    const task = this.get(taskId)

    if (task.parent) {
      this.deleteFromParent(task)
    }

    runInAction(() => {
      task.folderId = null
      task.depth = 1
    })

    this.changeSubtaskFolder(task)
  }

  public addFileToTask(task: Task, file: FileData) {
    const url = FileService.fileUrl(task, file.id as number)
    const newFile = { ...file, name: file.originalName, src: url }
    task.files.push(newFile)
  }

  public deleteFile(task: Task, fileId: number): void {
    const url = FileService.fileUrl(task, fileId)
    task.content = task.content?.replace(url, '')
    const index = task.files.findIndex((f) => f.id === fileId)
    task.files.splice(index, 1)
  }

  public get(taskId: number): Task {
    const task = this.getWithoutError(taskId)

    if (!task?.id) {
      throw new Error('Task not found: ' + taskId)
    }

    return task
  }

  public getWithoutError(taskId: number): Task | null {
    return this._mapTasks.get(taskId) ?? null
  }

  public clear() {
    runInAction(() => {
      this._loading = false
      this._tasks = []
      this._trackingTask = {} as Task
      this._mapTasks.clear()
      this._finishedTasks = []
    })
  }

  public updateFullTask(id: number, dto: ExtendedTaskResponse): void {
    const proxyTask = this.get(id)

    proxyTask.parent = proxyTask.parentId
      ? this.get(proxyTask.parentId)
      : undefined
    this.processIfExistsSubtasks(proxyTask)

    proxyTask.isFullyFetched = true
    proxyTask.totalSecondsTacked = dto.totalSecondsTacked
    proxyTask.userSecondsTracked = dto.userSecondsTracked
    proxyTask.invited = dto.invited
    proxyTask.files = dto.files
  }

  public assignUser([task, user]: AssignUserRequest): void {
    runInAction(() => {
      task.executor = user
    })
  }

  public reassignUser(task: Task): void {
    runInAction(() => {
      task.executor = null
    })
  }

  public changeAssigner([task, user]: AssignUserRequest): void {
    task.assigner = user
  }

  public assignObserver([task, user]: AssignObserverRequest): void {
    const observer: IObserver = {
      user,
      role: { code: 'observer', name: 'Observer' }
    }

    runInAction(() => {
      if (
        !task.invited.some(
          (existingObserver) => existingObserver.user.id === user.id
        )
      ) {
        task.invited.push(observer)
      }
    })
  }

  public reassignObserver([task, user]: AssignObserverRequest): void {
    runInAction(() => {
      task.invited = task.invited.filter(
        (existingObserver) => existingObserver.user.id !== user.id
      )
    })
  }

  public addTask(task: Task): void {
    runInAction(() => {
      this._mapTasks.set(task.id, task)
      this._mapExternalIds.set(task.externalId, task.id)
      this._tasks.unshift(this.get(task.id))
    })

    this.activeProject.taskCount++
  }

  public addSubtask(parentId: number, subtask: Task) {
    const parent = this.get(parentId)
    runInAction(() => {
      parent.subtasks.unshift(subtask)
      parent.subtasksIds.unshift(subtask.id)
    })
  }

  public deleteTag(task: Task, tag: ITag) {
    const index = task.tags.findIndex((o) => o.id === tag.id)
    if (index === -1) {
      throw new Error(`Not found tag from task: ${task.id}, tagId: ${tag.id}`)
    }
    runInAction(() => {
      task.tags.splice(index, 1)
    })
  }

  public addTag(task: Task, tag: ITag) {
    runInAction(() => {
      task.tags = [...task.tags, tag]
    })
  }

  public updateStatus(task: Task, status: ITaskStatus): void {
    task.status = status
  }

  public getRootTasks(): Task[] {
    return this.tasks.filter((task) => !task.parent && !task.folderId)
  }

  public getLengthOfTree(task: Task): number {
    if (!task.subtasks.length) {
      return 0
    }

    let length: number = 0

    for (const subtask of task.subtasks) {
      length = task.subtasks.length + this.getLengthOfTree(subtask)
    }

    return length
  }

  public changeCollapse(task: Task) {
    runInAction(() => {
      task.isCollapsed = !task.isCollapsed
    })
  }

  public mapTaskDTOToTask(dto: TaskResponse): Task {
    const currentUser = this._authStore.user
    const task = new Task(
      dto,
      this._projectStore.get(dto.projectId),
      this._projectStore.getStatusById(dto.statusId),
      currentUser
    )
    this._mapTasks.set(task.id, task)
    this._mapExternalIds.set(task.externalId, task.id)

    return this._mapTasks.get(task.id) as Task
  }

  public addSprint(taskId: number, sprintId: number) {
    const task = this.get(taskId)

    runInAction(() => (task.sprintId = sprintId))
  }

  public removeSprint(taskId: number) {
    const task = this.get(taskId)

    runInAction(() => (task.sprintId = null))
  }

  public push(...tasks: Task[]) {
    this._tasks.push(...tasks)
  }

  public deleteTaskTimeHistory(history: TaskTimerHistoryResponse) {
    const task = this.get(history.taskId)

    task.timeHistory = task.timeHistory.filter((h) => h.id !== history.id)

    const startTime = history.startTime
      ? new Date(history.startTime)
      : new Date(0)
    const endTime = history.endTime ? new Date(history.endTime) : new Date(0)

    const timeDifference: number =
      calculateTimeDifferenceInSeconds(startTime, endTime) || 0

    task.userSecondsTracked -= timeDifference
  }

  public startTrackingTask(task: Task, startedAt: Date) {
    task.activeDate = startedAt
    this.trackingTask = task
  }

  public stopTrackingTask(seconds: number) {
    const proxyTrackingTask = this.get(this.trackingTask.id)

    proxyTrackingTask.activeDate = null
    proxyTrackingTask.userSecondsTracked = seconds

    this.trackingTask = {} as Task
  }

  public duplicate(
    dto: IDuplicateStatusDTO,
    status: ITaskStatus
  ): { duplicatedStatus: ITaskStatus; duplicatedTasks: Task[] } {
    const duplicatedStatus: ITaskStatus = {
      ...status,
      id: dto.id,
      name: dto.name,
      code: null
    }

    this._projectStore.createTaskStatus(duplicatedStatus)

    this._projectStore.activeProject.taskCount += dto.tasksDTOs.length

    const duplicatedTasks = this.mapperTasks(dto.tasksDTOs)

    return { duplicatedStatus, duplicatedTasks }
  }

  public incrementFileCounter(task: Task) {
    const proxy = this.get(task.id)
    proxy.filesCount++
  }

  public decrementFileCounter(task: Task) {
    const proxy = this.get(task.id)
    proxy.filesCount--
  }

  public incrementCommentCounter(task: Task) {
    const proxy = this.get(task.id)
    proxy.commentsCount++
  }

  public decrementCommentCounter(task: Task) {
    const proxy = this.get(task.id)
    proxy.commentsCount--
  }

  private mapperTasks(tasksDTOs: TaskResponse[]) {
    if (!tasksDTOs.length) return []

    let tasksByStatus: Record<UniqueIdentifier, UniqueIdentifier[]> = {}

    const tasks = tasksDTOs.map((dto: TaskResponse) => {
      const currentUser = this._authStore.user

      const proxyTask = this.mapTaskDTOToTask(dto)

      this.processIfActiveTask(proxyTask, currentUser)
      this.processIfFinishedTask(proxyTask)

      const statusId = proxyTask.status.id
      if (!tasksByStatus[statusId]) {
        tasksByStatus[statusId] = [proxyTask.id]
      } else {
        tasksByStatus[statusId].push(proxyTask.id)
      }

      this.tasks.push(proxyTask)

      return proxyTask
    })

    for (const task of tasks) {
      task.parent = task.parentId ? this.get(task.parentId) : undefined
      this.processIfExistsSubtasks(task)
    }

    for (const task of tasks) {
      if (task.parent) {
        task.depth = task.parent.depth + 1
      } else {
        task.depth = 1
      }
    }

    return tasks
  }

  private processIfActiveTask(task: Task, user: IUser) {
    if (task.activeDate !== null && task.executor?.id === user.id) {
      this.trackingTask = task
    }
  }

  private processIfExistsSubtasks(task: Task) {
    if (task.subtasksIds.length > 0) {
      task.subtasks = task.subtasksIds.map((s) => {
        return this.get(s)
      })
    }
  }

  private processIfFinishedTask(task: Task) {
    if (
      task.dateFinished &&
      !this._finishedTasks.find((ft) => ft.id === task.id)
    ) {
      this._finishedTasks.push(task)
    }
  }

  private fillOrder(tasks: Task[]): void {
    const { multiPropertySort } = FilterHelper
    const defaultSorters = TaskFilterStore.DEFAULT_SORTER
    const keys = TaskFilterStore.getKeysForMultiSort<Task>(defaultSorters)

    const rootTasksSort = tasks.sort(multiPropertySort<Task>(...keys))

    let order = 1

    for (const task of rootTasksSort) {
      if (task.order) {
        const p = rootTasksSort[task.order - 1]
        if (p && !p.order) {
          p.order = order
        }

        order++
        this.fillSubtasks(task)
        continue
      }

      task.order = order

      this._mapTasks.set(task.id, task)

      order++
      this.fillSubtasks(task)
    }
  }

  private fillSubtasks(task: Task) {
    if (!!task.subtasks?.length) {
      this.fillOrder(task.subtasks)
    }
  }

  private deleteFromStore(task: Task) {
    runInAction(() => {
      this._tasks = this.tasks.filter((t) => t.id !== task.id)
      this._finishedTasks = this.finishedTasks.filter((t) => t.id !== task.id)
      this._mapTasks.delete(task.id)
    })
  }

  private async fetchTasksByProject(
    signal?: AbortSignal
  ): Promise<TaskResponse[]> {
    return ProjectService.getTasksByProject(
      this._projectStore.activeProject,
      signal
    )
  }

  private deleteFromParent(deletedTask: Task) {
    if (!deletedTask.parentId) {
      return
    }

    const parent = this.get(deletedTask.parentId)

    runInAction(() => {
      parent.subtasks = parent.subtasks.filter(
        (child) => child.id !== deletedTask.id
      )
      parent.subtasksIds = parent.subtasksIds.filter(
        (childId) => childId !== deletedTask.id
      )
    })
  }

  private deleteSubtasks(task: Task) {
    runInAction(() => {
      task.subtasks.forEach((subtask) => {
        this.deleteFromStore(subtask)
        if (subtask.subtasks.length) {
          this.deleteSubtasks(subtask)
        }
      })
    })
  }

  private finishSubtask(task: Task) {
    for (const subtask of task.subtasks) {
      if (!subtask.dateFinished && !subtask.finishedByTaskId) {
        runInAction(() => {
          subtask.finishedByTaskId = task.id
          if (!subtask.executor) {
            subtask.executor = LocalStorageHelper.getUser()
          }
        })

        this.updateStatus(subtask, task.status)
      }

      this._finishedTasks.push(subtask)

      if (!isEmpty(subtask.subtasks)) {
        this.finishSubtask(subtask)
      }
    }
  }

  private updateSubtasksSprint(sprintId: number | null, parent: Task) {
    if (!parent.hasChildren) {
      return
    }
    for (const subtask of parent.subtasks) {
      subtask.sprintId = sprintId

      this.updateSubtasksSprint(sprintId, subtask)
    }
  }

  private fetchTrackingTask(): Promise<TrackingTaskResponse | void> {
    return TaskService.getTrackingTask()
  }

  private changeSubtaskFolder(task: Task): void {
    if (!task.subtasks.length) return

    task.subtasks.forEach((subtask) => {
      subtask.folderId = task.folderId

      this.changeSubtaskFolder(subtask)
    })
  }

  private async mapTrackingTaskDTOToTask(
    dto: TrackingTaskResponse
  ): Promise<Task> {
    const projectDTO = await ProjectService.getProject(
      dto.projectId,
      dto.workspaceId
    )

    const [project] = await this._projectStore.mapProjectDTOsToProjects({
      ...projectDTO,
      workspaceId: dto.workspaceId
    })

    const status = project.statuses.find((s) => s.id === dto.statusId)

    if (!status) {
      throw new Error('Can not find status of tracking task!')
    }

    const task = new Task(dto, project, status, LocalStorageHelper.getUser())
    task.userSecondsTracked = dto.userSecondsTracked
    return task
  }
}
