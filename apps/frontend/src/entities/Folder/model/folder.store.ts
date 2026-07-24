import { makeAutoObservable, runInAction } from 'mobx'
import { ICreateFolderDTO, IFolderDTO } from '@/entities/Folder'
import { Folder } from '@/entities/Folder/model/folder'
import { IUpdateFolderDTO } from '@/entities/Folder/model/types/folder.interface'
import { ProjectStore } from '@/entities/Project'
import { ProjectService } from '@/entities/Project/services/project.service'
import { Task, TaskChangeFolderRequest, TaskStore } from '@/entities/Task'
import { RouterParams } from '@/shared/config/route.config'
import { LocalStorageHelper } from '@/shared/lib/helpers/local-storage.helper'
import { getIndexFromObjects } from '@/shared/lib/helpers/main.helper'
import { ICreatedRecord } from '@/shared/types/created-record.interface'


export class FolderStore {
  private _loading: boolean = true
  private _folders: Folder[] = []
  private _activeFolder: Folder | null = null
  private _mapFolders: Map<number, Folder> = new Map<number, Folder>()
  private readonly _projectStore: ProjectStore
  private readonly _taskStore: TaskStore

  constructor(projectStore: ProjectStore, taskStore: TaskStore) {
    makeAutoObservable(this)

    this._projectStore = projectStore
    this._taskStore = taskStore
  }

  get loading(): boolean {
    return this._loading
  }

  get folders(): Folder[] {
    return this._folders
  }

  get rootFolders(): Folder[] {
    return this._folders.filter((folder) => !folder.parentId)
  }

  get activeFolder(): Folder | null {
    return this._activeFolder
  }

  set activeFolder(value: Folder) {
    this._activeFolder = value
  }

  public async init(
    params: RouterParams | undefined = undefined
  ): Promise<void> {
    if (!this._projectStore.projects.length) {
      return
    }

    runInAction(() => {
      this._loading = true
      this._folders = []
      this._mapFolders.clear()
      this._activeFolder = null
    })

    const folderDTOs: IFolderDTO[] = await this.fetchFoldersByProject()

    this._folders = this.mapFolders(folderDTOs)

    for (const folder of this._folders) {
      folder.subFolders = folder.subFoldersIds.map((sId) => this.get(sId))

      if (folder.parentId) {
        folder.parent = this.get(folder.parentId)
      }
    }

    if (params?.folderId) {
      this._activeFolder = this.get(Number(params.folderId))
    }

    runInAction(() => {
      this._loading = false
    })
  }

  public mapFolders(folderDTOs: IFolderDTO[]): Folder[] {
    return folderDTOs.map((dto) => {
      const tasks = dto.taskIds.map((id) => this._taskStore.get(id))
      const project = this._projectStore.get(dto.projectId)

      const folder = new Folder(dto, tasks, project)

      this._mapFolders.set(dto.id, folder)

      return this.get(dto.id)
    })
  }

  public get(id: number): Folder {
    const folder = this._mapFolders.get(id)

    if (!folder) {
      throw new Error(`Can't find folder with id: ${id}`)
    }

    return folder
  }

  public create(data: ICreatedRecord, dto: ICreateFolderDTO) {
    if (!data.title) {
      throw new Error('Can not get folder name from server')
    }

    const user = LocalStorageHelper.getUser()

    const project = this._projectStore.get(dto.projectId)

    const folder = new Folder(
      {
        id: data.id,
        title: data.title,
        userId: user.id,
        projectId: dto.projectId,
        parentId: dto.parentId,
        dateUpdated: undefined,
        dateCreated: new Date().toString(),
        customOrder: 1,
        taskIds: [],
        subFolderIds: [],
        user: user,
        taskCount: 0
      },
      [],
      project
    )

    this._mapFolders.set(folder.id, folder)

    const proxyFolder = this.get(folder.id)

    if (dto.parentId) {
      proxyFolder.parent = this.get(dto.parentId)
      this.addSubFolder(dto.parentId, proxyFolder)
    }

    runInAction(() => {
      this._folders.unshift(proxyFolder)
    })
  }

  public update(dto: IUpdateFolderDTO) {
    const proxyFolder = this.get(dto.id)

    if (dto.title) {
      proxyFolder.title = dto.title
    }
  }

  public delete(folder: Folder) {
    this.deleteFromStore(folder)
    this.deleteFromParents(folder)

    if (folder.subFolders) {
      this.deleteSubFolders(folder)
    }
  }

  public addTaskToFolder(task: Task, folderId: number) {
    const folder = this.get(folderId)

    runInAction(() => folder.tasks.unshift(task))
  }

  public clearActiveFolder(): void {
    this._activeFolder = null
  }

  public moveTaskToFolder(dto: TaskChangeFolderRequest): void {
    const task = this._taskStore.get(dto.taskId)

    if (task.folderId) {
      runInAction(() => {
        this.deleteTaskFromFolder(task)
      })
    }

    task.folderId = dto.folderId

    this.addTaskToFolder(task, dto.folderId)
  }

  public moveTaskToRoot(taskId: number): void {
    const task = this._taskStore.get(taskId)

    if (task.folderId) {
      runInAction(() => {
        this.deleteTaskFromFolder(task)
        task.folderId = null
      })
    }
  }

  public deleteTaskFromFolder(task: Task) {
    if (!task.folderId) {
      return
    }

    const folder = this.get(task.folderId)

    runInAction(() => {
      folder.tasks = folder.tasks.filter((t) => t.id !== task.id)
    })
  }

  private async fetchFoldersByProject(): Promise<IFolderDTO[]> {
    return ProjectService.getFoldersByProject(this._projectStore.activeProject)
  }

  private addSubFolder(parentId: number, subFolder: Folder): void {
    const parent = this.get(parentId)

    runInAction(() => parent.subFolders.unshift(subFolder))
  }

  private deleteSubFolders(folder: Folder) {
    runInAction(() => {
      folder.subFolders.forEach((subfolder) => {
        const index = getIndexFromObjects<Folder>(
          this.folders,
          (el) => el.id === subfolder.id
        )
        this._folders.splice(index, 1)
        this._mapFolders.delete(subfolder.id)

        if (subfolder.hasSubFolders) {
          this.deleteSubFolders(subfolder)
        }
      })
    })
  }

  private deleteFromStore(folder: Folder) {
    runInAction(() => {
      const index = getIndexFromObjects<Folder>(
        this.folders,
        (el) => el.id === folder.id
      )

      this._folders.splice(index, 1)
      this._mapFolders.delete(folder.id)
    })
  }

  private deleteFromParents(folder: Folder) {
    if (!folder.parent) {
      return
    }

    const parent = folder.parent

    parent.subFolders = parent.subFolders.filter(
      (child) => child.id !== folder.id
    )
  }
}
