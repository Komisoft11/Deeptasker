import { QueryClient } from '@tanstack/query-core'
import { makeAutoObservable } from 'mobx'
import { DialogStore } from '@/entities/Dialog'
import { FolderStore } from '@/entities/Folder'
import { FolderFilterStore } from '@/entities/FolderFilter'
import { ProjectStore } from '@/entities/Project'
import { ProjectFilterStore } from '@/entities/ProjectFilter'
import { SidebarStore } from '@/entities/Sidebar'
import { SprintStore } from '@/entities/Sprint/model/sprint.store'
import { StatusFilterStore } from '@/entities/StatusFilter'
import { TaskStore, TaskTimerStore } from '@/entities/Task'
import { TaskCommentStore } from '@/entities/TaskComment'
import { TaskFilterStore } from '@/entities/TaskFilter'
import { TaskPlannerStore } from '@/entities/TaskPlanner'
import { AuthStore } from '@/entities/User'
import { WorkspaceStore } from '@/entities/Workspace'
import { TestStore } from '@/entities/lib/stores/test.store'
import ThemeModeStore from '@/entities/lib/stores/theme-mode.store'
import WebSocketStore from '@/entities/lib/stores/web-socket.store'
import { RouterParams } from '@/shared/config/route.config'
import { PromiseHelper } from '@/shared/lib/helpers/promise.helper'

class RootStore {
  public loadingApp: boolean = false
  authStore: AuthStore
  projectStore: ProjectStore
  projectFilterStore: ProjectFilterStore
  taskStore: TaskStore
  taskTimerStore: TaskTimerStore
  taskCommentStore: TaskCommentStore
  taskPlanerStore: TaskPlannerStore
  taskFilterStore: TaskFilterStore
  folderStore: FolderStore
  folderFilterStore: FolderFilterStore
  statusFilterStore: StatusFilterStore
  themeModeStore: ThemeModeStore
  workspaceStore: WorkspaceStore
  dialogStore: DialogStore
  webSocketStore: WebSocketStore
  sidebarStore: SidebarStore
  testStore: TestStore
  sprintStore: SprintStore

  constructor(ql: QueryClient) {
    const workspaceStore = new WorkspaceStore()
    this.workspaceStore = workspaceStore
    const taskPlanerStore = new TaskPlannerStore()
    const projectStore = new ProjectStore(workspaceStore)
    this.sidebarStore = new SidebarStore()
    this.authStore = new AuthStore(this.sidebarStore)
    const taskStore = new TaskStore(projectStore, this.authStore, ql)
    this.projectFilterStore = new ProjectFilterStore()
    this.folderStore = new FolderStore(projectStore, taskStore)
    this.sprintStore = new SprintStore(projectStore, taskStore)
    this.webSocketStore = new WebSocketStore(
      workspaceStore,
      projectStore,
      taskStore,
      this.sprintStore,
      this.folderStore,
      ql
    )
    this.projectStore = projectStore
    this.taskStore = taskStore
    this.taskPlanerStore = taskPlanerStore

    this.taskTimerStore = new TaskTimerStore(taskStore)
    this.themeModeStore = new ThemeModeStore()
    this.taskCommentStore = new TaskCommentStore()
    this.taskFilterStore = new TaskFilterStore()
    this.folderFilterStore = new FolderFilterStore()
    this.statusFilterStore = new StatusFilterStore(projectStore)
    this.dialogStore = new DialogStore()
    this.testStore = new TestStore()
    makeAutoObservable(this)
  }
  private _initPromise: Promise<void> | null = null

  setLoadingApp(isLoading: boolean) {
    this.loadingApp = isLoading
  }

  public async init(params: RouterParams, filters: URLSearchParams) {
    if (this._initPromise) {
      return this._initPromise
    }

    this._initPromise = this._initInternal(params, filters)

    try {
      await this._initPromise
    } finally {
      this._initPromise = null
    }
  }

  private async _initInternal(params: RouterParams, filters: URLSearchParams) {
    await this.authStore.init()

    if (!this.authStore.isAuth) return

    this.setLoadingApp(true)
    this.themeModeStore.init()

    await PromiseHelper.runPromisesSequentially([
      () => this.workspaceStore.init(params),
      () => this.projectStore.init(params),
      () => this.taskStore.init(),
      () => this.folderStore.init(params),
      () => this.taskFilterStore.init(filters),
      () => this.taskTimerStore.init(),
      () => this.sprintStore.init()
    ])

    this.statusFilterStore.init()
    this.setLoadingApp(false)
    this.authStore.isAppInitialization = true
  }

  public destructor() {
    this.taskStore.clear()
    this.taskTimerStore.clear()
    this.authStore.clear()
    this.taskCommentStore.clear()
    this.taskFilterStore.clear()
  }
}

export { RootStore }
