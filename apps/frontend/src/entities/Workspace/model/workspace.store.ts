import { makeAutoObservable, runInAction } from 'mobx'
import { SprintsService } from '@/entities/Sprint/services/sprint.service'
import { AuthService, IUser } from '@/entities/User'
import {
  ICreatedWorkspaceDTO,
  IPermissionWorkspace,
  IWorkspaceDTO,
  IWorkspaceUpdateDto,
  Workspace
} from '@/entities/Workspace'
import { WorkspaceService } from '@/entities/Workspace/service/workspace.service'
import { RouterParams } from '@/shared/config/route.config'
import { LocalStorageHelper } from '@/shared/lib/helpers/local-storage.helper'
import { isEmpty } from '@/shared/lib/helpers/main.helper'

export class WorkspaceStore {
  private _workspaces: Workspace[] = []
  private _mapWorkspaces: Map<number, Workspace> = new Map<number, Workspace>()
  private _activeWorkspace: Workspace = {} as Workspace
  private _currentPermissionsWorkspace: IPermissionWorkspace =
    {} as IPermissionWorkspace

  constructor() {
    makeAutoObservable(this)
  }

  get workspaces(): Workspace[] {
    return this._workspaces
  }

  set workspaces(value: Workspace[]) {
    this._workspaces = value
  }

  get activeWorkspace(): Workspace {
    return this._activeWorkspace
  }

  set activeWorkspace(value: Workspace) {
    this._activeWorkspace = value
    SprintsService.setWorkspaceId(value.id)
  }

  get currentPermissionsWorkspace(): IPermissionWorkspace {
    return this._currentPermissionsWorkspace
  }

  set currentPermissionsWorkspace(value: IPermissionWorkspace) {
    this._currentPermissionsWorkspace = value
  }

  public async init({ spaceId }: RouterParams) {
    await this.loadWorkspaces()

    this.setActiveWorkspace(spaceId)

    if (isEmpty(this.activeWorkspace)) {
      throw new Error('Active workspace is empty or not set.')
    }

    await this.loadPermissions()
  }

  public create(dto: ICreatedWorkspaceDTO): Workspace {
    const userCreator = LocalStorageHelper.getUser()

    this.addWorkspace(
      new Workspace({
        ...dto,
        user: userCreator,
        projectCount: 0,
        archivedProjectCount: 0
      })
    )

    return this.get(dto.id)
  }

  public delete(workspace: Workspace): void {
    runInAction(() => {
      this.workspaces = this.workspaces.filter((w) => w.id !== workspace.id)
      this._mapWorkspaces.delete(workspace.id)
    })
  }

  public update(dto: IWorkspaceUpdateDto): void {
    const workspace = this.get(dto.id)
    const { id, ...dtoWithoutId } = dto

    runInAction(() => {
      Object.assign(workspace, dtoWithoutId)
    })
  }

  public get(workspaceId: number): Workspace {
    const workspace = this._mapWorkspaces.get(workspaceId)

    if (!workspace) {
      throw new Error("Can't find WS by id:" + workspaceId)
    }

    return workspace
  }

  public async currentUserFetchPermissions(workspace: Workspace, user: IUser) {
    this.currentPermissionsWorkspace = await AuthService.getPermissionWorkspace(
      workspace,
      user
    )
  }

  private async loadWorkspaces() {
    const workspaceDTOs = await this.fetchWorkspaces()
    runInAction(() => {
      this._workspaces = this.mapWorkspaceDTOsToWorkspaces(workspaceDTOs)
      this.updateMapWorkspaces()
    })
  }

  private setActiveWorkspace(spaceId?: string) {
    if (!spaceId) {
      const workspace = this._mapWorkspaces.get(Number(spaceId))

      if (workspace?.id) {
        this.activeWorkspace = workspace
      } else {
        this.activeWorkspace = this.workspaces[0]
      }
    } else {
      this.activeWorkspace = this.get(Number(spaceId))
    }
  }

  private updateMapWorkspaces() {
    this._mapWorkspaces = new Map(this._workspaces.map((ws) => [ws.id, ws]))
  }

  private async loadPermissions() {
    const user = LocalStorageHelper.getUser()
    this._currentPermissionsWorkspace =
      await AuthService.getPermissionWorkspace(this.activeWorkspace, user)
  }

  private async fetchWorkspaces() {
    return WorkspaceService.getAll()
  }

  private mapWorkspaceDTOsToWorkspaces(DTOs: IWorkspaceDTO[]): Workspace[] {
    return DTOs.map((dto) => {
      const workspace = new Workspace(dto)

      this._mapWorkspaces.set(workspace.id, workspace)

      return workspace
    })
  }

  private addWorkspace(workspace: Workspace): void {
    runInAction(() => {
      this._mapWorkspaces.set(workspace.id, workspace)
      this._workspaces.push(workspace)
    })
  }
}
