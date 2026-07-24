import { QueryClient } from '@tanstack/query-core'
import { IProjectDto, ProjectStore } from '@/entities/Project'
import { IUser } from '@/entities/User'
import { IPermissionWorkspace, WorkspaceStore } from '@/entities/Workspace'
import { AdminInviteesDTO } from '@/entities/Workspace/model/types/workspace.interface'
import { queries } from '@/entities/lib/api/all-queries'
import {
  IInvitee,
  IMessageExecutor,
  IProjectCreate,
  IProjectMessage,
  IWorkspaceAdmin,
  IWorkspaceMessage,
  IWorkspaceUpdateDto
} from '@/entities/lib/components/web_socket/message_executors/types/message-executor.interface'
import { LocalStorageHelper } from '@/shared/lib/helpers/local-storage.helper'

const MEMBER_TYPE = {
  ADD: 'add',
  REMOVE: 'remove',
  UPDATE_PERMISSIONS: 'updatePermissions'
}

export class SubscribeWorkspaceMessageExecutor implements IMessageExecutor {
  private readonly workspaceStore: WorkspaceStore
  private readonly projectStore: ProjectStore
  private readonly queryClient: QueryClient | null = null

  constructor(
    workspaceStore: WorkspaceStore,
    projectStore: ProjectStore,
    queryClient: QueryClient
  ) {
    this.workspaceStore = workspaceStore
    this.projectStore = projectStore
    this.queryClient = queryClient
  }

  async execute(event: MessageEvent): Promise<void> {
    const workspaceMessage = JSON.parse(event.data) as IWorkspaceMessage

    const { workspace } = workspaceMessage

    if (workspace.delete) this.handleDeleteWorkspace(workspace.id)
    if (workspace.update)
      this.handleUpdateWorkspace(
        workspace.id,
        workspace.update as IWorkspaceUpdateDto
      )
    if (workspace.project) {
      const hasAccessToProject = Boolean(
        this.projectStore.projects.find((p) => p.id === workspace.project?.id)
          ?.id
      )

      if (hasAccessToProject) {
        await this.handleProjectEvent(workspace.project, workspace.id)
      }
    }
  }

  private handleDeleteWorkspace(workspaceId: number) {
    const workspace = this.workspaceStore.get(workspaceId)
    this.workspaceStore.delete(workspace)
  }

  private handleUpdateWorkspace(
    workspaceId: number,
    update: IWorkspaceUpdateDto
  ) {
    if (update.title) {
      const dto = { title: update.title, id: workspaceId }
      this.workspaceStore.update(dto)
    } else if (update.admin) {
      this.handleUpdateAdmins(workspaceId, update.admin)
    } else if (update.invitee) {
      this.handleUpdateInvitees(workspaceId, update.invitee)
    }
  }

  private handleUpdateAdmins(workspaceId: number, update: IWorkspaceAdmin) {
    const qc = this.queryClient

    if (!qc) return

    const workspace = this.workspaceStore.get(workspaceId)

    switch (update.type) {
      case MEMBER_TYPE.ADD:
        qc.setQueryData<IUser[]>(
          queries.workspace.admin(workspace).queryKey,
          (oldUsers) => (oldUsers ? [...oldUsers, update.admin] : oldUsers)
        )
        break

      case MEMBER_TYPE.REMOVE:
        qc.setQueryData<IUser[]>(
          queries.workspace.admin(workspace).queryKey,
          (oldUsers) =>
            oldUsers?.filter((user) => user.id !== update.admin.id) ?? []
        )
        break

      case MEMBER_TYPE.UPDATE_PERMISSIONS:
        qc.setQueryData<IPermissionWorkspace>(
          queries.user.permissionsWorkspace(workspace, update.admin).queryKey,
          (old) => ({
            ...old,
            ...update.permissions
          })
        )
        break

      default:
        console.log('Unknown member event')
    }
  }

  private handleUpdateInvitees(workspaceId: number, update: IInvitee) {
    console.log('invitee')
    const qc = this.queryClient

    if (!qc) return
    console.log('testing')
    const workspace = this.workspaceStore.get(workspaceId)

    switch (update.type) {
      case MEMBER_TYPE.ADD:
        console.log('adding')
        qc.setQueryData<AdminInviteesDTO[]>(
          queries.workspace.invitees(workspace).queryKey,
          (invitees = []) => [
            ...invitees,
            { email: update.email, senderId: update.senderId }
          ]
        )
        break

      case MEMBER_TYPE.REMOVE:
        console.log('removing')
        qc.setQueryData<AdminInviteesDTO[]>(
          queries.workspace.invitees(workspace).queryKey,
          (emails = []) =>
            emails.filter((invite) => invite.email !== update.email)
        )
        break

      default:
        console.log('Unknown member event')
    }
  }

  private async handleProjectEvent(
    projectEvent: IProjectMessage,
    workspaceId: number
  ) {
    const {
      create,
      delete: deleteProject,
      id: projectId,
      update
    } = projectEvent

    if (update) {
      this.handleUpdateProject(projectId, update as IProjectDto)
    } else if (create) {
      await this.handleCreateProject(projectId, workspaceId, create)
    } else if (deleteProject) {
      await this.handleDeleteProject(projectId)
    }
  }

  private handleUpdateProject(projectId: number, update: IProjectDto) {
    const project = this.projectStore.get(projectId)
    Object.assign(project, update)
  }

  private async handleCreateProject(
    projectId: number,
    workspaceId: number,
    create: IProjectCreate
  ) {
    const dtoWithInvites: IProjectCreate = {
      id: projectId,
      workspaceId: workspaceId,
      uuid: create.uuid,
      title: create.title,
      slug: create.slug,
      parentId: create.parentId,
      rootId: create.rootId,
      order: create.order,
      taskCount: create.taskCount,
      folderCount: create.folderCount,
      iconBg: create.iconBg,
      iconFg: create.iconFg,
      user: create?.user,
      invitees: create?.members,
      statuses: create?.statuses,
      tags: create?.tags,
      dateCreated: create.dateCreated,
      dateArchived: create.dateArchived,
      settings: create.settings,
      dateUpdated: create.dateUpdated
    }

    await this.projectStore.create(dtoWithInvites)
  }

  private async handleDeleteProject(projectId: number) {
    const project = this.projectStore.get(projectId)
    this.projectStore.delete(project)
    const countExitingProject = this.projectStore.projects.length

    if (countExitingProject > 0) {
      await this.projectStore.init()
    } else {
      const workspace = this.workspaceStore.workspaces.find(
        (workspace) => workspace.user.id === LocalStorageHelper.getUser().id
      )
      if (!workspace) return
      await this.workspaceStore.init({
        spaceId: String(workspace.id)
      })
      await this.projectStore.init()
    }
  }
}
