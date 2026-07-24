import { makeAutoObservable, runInAction } from 'mobx'
import { Project, ProjectService } from '@/entities/Project'
import { user } from '@/entities/Project/model/permissions/project.permissions'
import {
  IProjectDto,
  IProjectPermissionRole,
  IProjectUpdateDto,
  ITag,
  ITagCreateDto,
  ITaskStatus,
  ITaskStatusUpdateDto
} from '@/entities/Project/model/types/project.interface'
import { AuthService } from '@/entities/User'
import { WorkspaceStore } from '@/entities/Workspace'
import { RouterParams } from '@/shared/config/route.config'
import { FilterHelper } from '@/shared/lib/helpers/filter.helper'
import { LocalStorageHelper } from '@/shared/lib/helpers/local-storage.helper'
import { consoLER } from '@/shared/lib/helpers/log'
import { getIndexFromObjects, isEmpty } from '@/shared/lib/helpers/main.helper'

export class ProjectStore {
  private _loading: boolean = false
  private _mapProjects: Map<number, Project> = new Map<number, Project>()

  private _projects: Project[] = []
  private _lastProjects: Project[] = []

  private _activeProject: Project = {} as Project

  private _currentUserPermissionsProject: IProjectPermissionRole = {
    role: 'user',
    permissions: user,
    projectId: 0
  }

  private readonly _workspaceStore: WorkspaceStore

  constructor(workspaceStore: WorkspaceStore) {
    makeAutoObservable(this, {}, { autoBind: true })
    this._workspaceStore = workspaceStore
  }

  get loading(): boolean {
    return this._loading
  }

  set loading(value: boolean) {
    this._loading = value
  }

  get lastProjects(): Project[] {
    return this._lastProjects
  }

  get activeProject(): Project {
    return this._activeProject
  }

  set activeProject(value: Project) {
    this._activeProject = value
  }

  get projects(): Project[] {
    return this._projects
  }

  set projects(value: Project[]) {
    this._projects = value
  }

  get currentUserPermissionsProject(): IProjectPermissionRole {
    return this._currentUserPermissionsProject
  }

  set currentUserPermissionsProject(value: IProjectPermissionRole) {
    this._currentUserPermissionsProject = value
  }

  async init(params?: RouterParams) {
    consoLER('INIT PROJECTS')

    this.clear()

    this.loading = true

    this.projects = await this.getProjects()

    this.setActiveProject(params)

    if (!isEmpty(this.activeProject)) {
      await this.fetchCurrentUserPermissionsProject(this.activeProject)
      await this.updateFullProject(this.activeProject)
    }

    this._lastProjects = []

    this.loading = false
  }

  public async fetchCurrentUserPermissionsProject(
    project: Project
  ): Promise<void> {
    if (project.id === this.currentUserPermissionsProject?.projectId) {
      consoLER('Equal permissions project, no fetch')
      return
    }

    if (!project?.id) {
      consoLER('No active project, no fetch')
      return
    }

    const user = LocalStorageHelper.getUser()

    const result: IProjectPermissionRole =
      await AuthService.getPermissionProject(this.activeProject, user)

    this.currentUserPermissionsProject = {
      projectId: project.id,
      ...result
    }
  }

  public getStatusById(id: number): ITaskStatus {
    const status = this.activeProject.statuses.find((s) => s.id === id)

    if (!status) {
      throw new Error(`not found status: ${id}`)
    }

    return status
  }

  public get(projectId: number): Project {
    const project = this._mapProjects.get(projectId)

    if (!project) {
      throw new Error('Project not found: ' + projectId)
    }

    return project
  }

  public getBySlug(slugId: string): Project | undefined {
    const index = getIndexFromObjects<Project>(
      this._projects,
      (el) => el.slug === slugId
    )

    return this._projects[index] ?? undefined
  }

  public update(dto: Partial<IProjectUpdateDto>): void {
    const project = this.get(Number(dto.id))

    project.isFullyFetched = true
    Object.assign(project, dto)
  }

  public delete(project: Project): void {
    runInAction(() => {
      this.projects = this.projects.filter((p) => p.id !== project.id)
      this._mapProjects.delete(project.id)
    })
  }

  public async create(dto: IProjectDto): Promise<Project> {
    const project = new Project(dto, this._workspaceStore.activeWorkspace)

    this._mapProjects.set(project.id, project)
    const projectProxy = this.get(project.id)
    runInAction(() => this._projects.unshift(projectProxy))
    await this.updateFullProject(projectProxy)
    return projectProxy
  }

  public clear() {
    runInAction(() => {
      this._projects = []
      this.activeProject = {} as Project
      this._mapProjects.clear()
    })
  }

  public async mapProjectDTOsToProjects(
    ...projectDTOs: IProjectDto[]
  ): Promise<Project[]> {
    if (!projectDTOs.length) return []

    return await Promise.all(
      projectDTOs.map(async (dto: IProjectDto): Promise<Project> => {
        const project: Project = new Project(
          dto,
          dto.workspaceId
            ? this._workspaceStore.get(dto.workspaceId)
            : this._workspaceStore.activeWorkspace
        )

        this._mapProjects.set(project.id, project)

        const proxy = this._mapProjects.get(project.id)

        if (!proxy) {
          throw new Error('Project not found with id: ' + project.id)
        }

        return proxy
      })
    )
  }

  public createTag(tag: ITag, dto: ITagCreateDto): ITag {
    const project = this.get(dto.projectId)

    runInAction(() => {
      project.tags.push(tag)
    })

    return tag
  }

  public changeTag(project: Project, tagId: number, dto: ITag): void {
    const tag = project.tags.find((t) => t.id === tagId)
    if (!tag) {
      throw new Error(`Tag with id ${tagId} not found in project ${project.id}`)
    }
    runInAction(() => {
      Object.assign(tag, dto)
    })
  }

  public deleteTag(projectId: number, tagId: number): void {
    const project = this.get(projectId)

    runInAction(() => {
      project.tags = project.tags.filter(
        (deletedTag) => deletedTag.id !== tagId
      )
    })
  }

  public createTaskStatus(status: ITaskStatus): ITaskStatus {
    runInAction(() => {
      this.activeProject.statuses.push(status)
    })

    return status
  }

  public deleteTaskStatus(status: ITaskStatus): void {
    this._activeProject.statuses = this.activeProject.statuses.filter(
      (s) => s.id !== status.id
    )
  }

  public updateTaskStatus(dto: ITaskStatusUpdateDto): ITaskStatus {
    const status = this.activeProject.statuses.find((s) => s.id === dto.id)
    if (!status) {
      throw new Error('Not found status for update')
    }
    runInAction(() => {
      Object.assign(status, dto)
    })

    return status
  }

  public async updateFullProject(project: Project): Promise<void> {
    if (!project?.id || project.isFullyFetched) {
      return
    }

    const data: IProjectDto = await ProjectService.getProject(
      project.id,
      project.workspace.id
    )

    this.update(data)

    project.isFullyFetched = true
  }

  private async getProjects(): Promise<Project[]> {
    let projectDTOs: IProjectDto[] = await this.fetchProjects()

    const projects = await this.mapProjectDTOsToProjects(...projectDTOs)

    return projects.sort(
      FilterHelper.genericSort({ property: 'dateCreated', sort: 'desc' })
    )
  }

  private setActiveProject(params?: RouterParams): void {
    this.activeProject = this.findActiveProject(params)

    if (isEmpty(this.activeProject) && this.projects.length) {
      this.activeProject = this.projects[0]
    }
  }

  private async fetchProjects(): Promise<IProjectDto[]> {
    if (isEmpty(this._workspaceStore.activeWorkspace)) {
      return []
    }

    return await ProjectService.getAll(this._workspaceStore.activeWorkspace.id)
  }

  private findActiveProject(params?: RouterParams): Project {
    if (params?.slugId) {
      const projectBySlug = this.getBySlug(params.slugId)
      if (projectBySlug) {
        return projectBySlug
      }
    }

    const projectIdFromParams = params?.projectId && Number(params.projectId)

    if (projectIdFromParams) {
      return this.get(projectIdFromParams)
    }

    return {} as Project
  }
}
