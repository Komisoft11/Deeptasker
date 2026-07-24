import { QueryClient, QueryKey } from '@tanstack/query-core'
import dayjs from 'dayjs'
import i18next from 'i18next'
import { runInAction } from 'mobx'
import { commentQueries } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/CommentTab/api/comment'
import { FolderStore, ICreateFolderDTO, IFolderDTO } from '@/entities/Folder'
import {
  IProjectPermissionRole,
  ITag,
  ITagCreateDto,
  Project,
  ProjectStore
} from '@/entities/Project'
import { IProjectInviteesDTO } from '@/entities/Project/model/types/project.interface'
import { IProjectReport, ReportStatus, reportsQueries } from '@/entities/Report'
import { SprintStore } from '@/entities/Sprint/model/sprint.store'
import {
  ISprintCreateDTO,
  ISprintUpdateDTO,
  SprintStatuses
} from '@/entities/Sprint/model/types/sprint.types'
import {
  MoveTaskRequest,
  Task,
  TaskChangeFolderRequest,
  TaskCreateRequest,
  TaskResponse,
  TaskStatusChanger,
  TaskStore
} from '@/entities/Task'
import { ITaskComment } from '@/entities/TaskComment'
import { ITaskCommentReaction } from '@/entities/TaskComment/model/types/task-comment.interface'
import { IUser } from '@/entities/User'
import { queries } from '@/entities/lib/api/all-queries'
import {
  IFolderMessage,
  IMessageExecutor,
  IProjectMessageEvent,
  ISprintMessage,
  ISprintUpdateTasks,
  IStatusMessage,
  ITaskMessage,
  ITaskUpdateEvent,
  IWebSocketInvitee,
  IWebSocketMember,
  IWebSocketObserver,
  IWebSocketProjectTag,
  IWebSocketTaskComment,
  IWebSocketTaskFile,
  IWebSocketTaskTag,
  IWebsocketMoveTask
} from '@/entities/lib/components/web_socket/message_executors/types/message-executor.interface'
import { ERRORS, SUCCESS } from '@/shared/const/translation'
import { LocalStorageHelper } from '@/shared/lib/helpers/local-storage.helper'
import { ICreatedRecord } from '@/shared/types/created-record.interface'
import { showToast } from '@/shared/ui/ToastNotification/ToastNotification'

const MEMBER_TYPE = {
  ADD: 'add',
  REMOVE: 'remove',
  UPDATE_PERMISSIONS: 'updatePermissions'
}

const COMMENT_TYPE = {
  ADD: 'add',
  DELETE: 'delete',
  UPDATE: 'update'
}

export class SubscribeProjectMessageExecutor implements IMessageExecutor {
  private readonly projectStore: ProjectStore
  private readonly taskStore: TaskStore
  private readonly sprintStore: SprintStore
  private readonly folderStore: FolderStore
  private readonly queryClient: QueryClient | null = null

  constructor(
    projectStore: ProjectStore,
    taskStore: TaskStore,
    sprintStore: SprintStore,
    folderStore: FolderStore,
    queryClient: QueryClient
  ) {
    this.projectStore = projectStore
    this.taskStore = taskStore
    this.sprintStore = sprintStore
    this.folderStore = folderStore
    this.queryClient = queryClient
  }

  public execute(event: MessageEvent): void | Promise<void> {
    const projectMessage = JSON.parse(event.data) as IProjectMessageEvent
    const { project } = projectMessage

    if (project.update)
      return this.handleProjectUpdate(
        project.update as IWebSocketMember | IWebSocketInvitee,
        project.id
      )
    if (project.tags)
      return this.handleUpdateProjectTags(project.tags, project.id)

    if (project.status) {
      return this.handleUpdateProjectStatus(project.status)
    }

    if (project.task) {
      const ql = this.queryClient
      return this.handleTaskEvent(project.task, ql)
    }

    if (project.folder) return this.handleFolderEvent(project.folder)

    if (project.sprint) return this.handleSprintEvent(project.sprint)

    if (project.report)
      return this.handleReportEvent(
        project.report,
        this.queryClient,
        project.id,
        projectMessage.userId === LocalStorageHelper.getUser().id
      )
  }

  private handleProjectUpdate(
    update: IWebSocketMember | IWebSocketInvitee,
    id: number
  ) {
    const project = this.projectStore.get(id)
    const ql = this.queryClient

    if (!ql) return

    if ('invitee' in update) {
      this.handleProjectUpdateInvitee(update, ql, project)
    }
    if ('member' in update) {
      this.handleProjectUpdateMember(update, ql, project)
    }
  }

  private handleProjectUpdateInvitee(
    update: IWebSocketInvitee,
    ql: QueryClient,
    project: Project
  ) {
    const { invitee } = update
    switch (invitee.type) {
      case MEMBER_TYPE.ADD:
        ql.setQueryData<IProjectInviteesDTO[]>(
          queries.project.invitees(project, project.workspace.id).queryKey,
          (emails = []) => [
            ...emails,
            { email: invitee.email, senderId: invitee.senderId }
          ]
        )
        break

      case MEMBER_TYPE.REMOVE:
        ql.setQueryData<IProjectInviteesDTO[]>(
          queries.project.invitees(project, project.workspace.id).queryKey,
          (emails = []) =>
            emails.filter((invite) => invite.email !== invitee.email)
        )

        break

      default:
        console.warn('[WS] Unknown member event type:', invitee.type)
    }
  }

  private handleProjectUpdateMember(
    update: IWebSocketMember,
    ql: QueryClient,
    project: Project
  ) {
    const { member } = update

    switch (member.type) {
      case MEMBER_TYPE.ADD:
        ql.setQueryData<IUser[]>(
          queries.project.members(project, project.workspace.id).queryKey,
          (old) => (old ? [...old, update.member.user] : old)
        )
        break

      case MEMBER_TYPE.REMOVE:
        ql.setQueryData<IUser[]>(
          queries.project.members(project, project.workspace.id).queryKey,
          (old) => (old ? old.filter((u) => u.id !== member.user.id) : [])
        )

        if (this.projectStore.activeProject?.id === project.id) {
          const hasProjectAfterDelete =
            this.projectStore.projects.length - 1 > 0

          this.projectStore.activeProject = hasProjectAfterDelete
            ? this.projectStore.projects.filter((p) => p.id !== project.id)[0]
            : ({} as Project)
        }

        break

      case MEMBER_TYPE.UPDATE_PERMISSIONS:
        ql.setQueryData<IProjectPermissionRole>(
          queries.user.permissionsProject(project, member.user).queryKey,
          (old) => {
            if (!old) return undefined
            return {
              ...old,
              projectId: project.id,
              role: member.role,
              permissions: member.permissions
            }
          }
        )
        break

      default:
        console.warn('[WS] Unknown member event type:', member.type)
    }
  }

  private handleUpdateProjectTags(
    tagEvents: IWebSocketProjectTag,
    projectId: number
  ) {
    const { add, update, delete: deleteTag } = tagEvents

    if (add) {
      const tag: ITag = {
        id: add.id,
        name: add.name,
        colorBg: add.color,
        colorFg: add.color
      }

      const tagDto: ITagCreateDto = {
        name: add.name,
        colorBg: add.color,
        projectId: projectId
      }

      this.projectStore.createTag(tag, tagDto)
    }

    if (deleteTag) {
      this.projectStore.deleteTag(projectId, deleteTag.id)
    }

    if (update) {
      const project = this.projectStore.get(projectId)
      const originalTag = project.tags.find((t) => t.id === update.id)

      if (!originalTag) {
        console.warn(
          `Tag with id ${update.id} not found in project ${projectId}`
        )
        return
      }

      const dto: ITag = {
        id: update.id,
        name: update.name ?? originalTag.name,
        colorBg: update.color ?? originalTag.colorBg,
        colorFg: update.color ?? originalTag.colorFg
      }

      this.projectStore.changeTag(project, update.id, dto)
    }
  }

  private handleTaskEvent(
    taskEvent: ITaskMessage,
    queryClient: QueryClient | null
  ): void | Promise<void> {
    const { update, create, id, delete: del, move } = taskEvent

    if (create) return this.handleTaskCreate(create)
    if (update) return this.handleUpdateTask(update, id, queryClient)
    if (del) return this.handleDeleteTask(del, id)
    if (move) return this.handleMoveTask(move, id)

    console.warn('Unknown task event:', taskEvent)
  }

  private async handleUpdateTask(
    updateTask: ITaskUpdateEvent,
    id: number,
    queryClient: QueryClient | null
  ) {
    let originalTask: Task = {} as Task
    try {
      originalTask = this.taskStore.get(id)
    } catch (e) {
      setTimeout(() => {
        originalTask = this.taskStore.get(id)
      }, 1000)
    }

    if (!originalTask?.id) {
      return
    }

    if ('comment' in updateTask)
      return this.handleCommentUpdate(updateTask, queryClient, originalTask)

    if ('tags' in updateTask)
      return this.handleTagsUpdate(
        updateTask as IWebSocketTaskTag,
        originalTask
      )

    if ('observers' in updateTask)
      return this.handleObserversUpdate(
        updateTask as IWebSocketObserver,
        originalTask
      )

    if ('file' in updateTask)
      return this.handleFileUpdate(
        updateTask as IWebSocketTaskFile,
        originalTask
      )

    if ('assigner' in updateTask)
      return this.handleAssignerUpdate(updateTask, originalTask)

    return this.handleSafeUpdate(updateTask as TaskResponse, originalTask)
  }

  private handleCommentUpdate(
    updateTask: IWebSocketTaskComment,
    queryClient: QueryClient | null,
    originalTask: Task
  ) {
    const {
      comment: { taskId, dto, type }
    } = updateTask
    if (!queryClient) return undefined

    const task = this.taskStore.get(taskId)
    const key = commentQueries.comments(task).queryKey

    switch (type) {
      case COMMENT_TYPE.ADD: {
        const comment: ITaskComment = {
          id: dto.id,
          user: dto.user,
          content: dto.content,
          reactions: [],
          files: dto.files ?? [],
          replyId: dto.replyId ?? null,
          dateCreated: new Date(),
          dateUpdated: null,
          dateDeleted: null
        }

        queryClient.setQueryData<ITaskComment[]>(key, (old) =>
          old ? [...old, comment] : [comment]
        )
        originalTask.comments.push(comment)

        break
      }

      case COMMENT_TYPE.DELETE: {
        const idToDelete = dto.id
        originalTask.comments = originalTask.comments.filter(
          (tC) => tC.id !== idToDelete
        )
        queryClient.setQueryData<ITaskComment[]>(key, (old) =>
          old ? old.filter((c) => c.id !== idToDelete) : []
        )
        break
      }

      case COMMENT_TYPE.UPDATE: {
        const dto = updateTask.comment.dto
        if (dto.reaction?.add) this.addReaction(dto.reaction.add, key)
        if (dto.reaction?.remove) this.removeReaction(dto.reaction.remove, key)
        if (!dto.reaction) {
          queryClient.setQueryData<ITaskComment[]>(key, (old = []) =>
            old.map((c) =>
              c.id === dto.id
                ? { ...c, content: dto.content, dateUpdated: new Date() }
                : c
            )
          )
        }
        return
      }

      default:
        console.warn('[WS] Unknown comment type:', type)
    }
  }

  private addReaction(newReaction: ITaskCommentReaction, key: QueryKey) {
    this.queryClient?.setQueryData<ITaskComment[]>(key, (old = []) =>
      old.map((c) => {
        if (c.id !== newReaction.commentId) return c
        const exists = c.reactions.some(
          (r) =>
            r.user.id === newReaction.user.id && r.name === newReaction.name
        )
        return {
          ...c,
          reactions: exists ? c.reactions : [...c.reactions, newReaction]
        }
      })
    )
  }

  private removeReaction(removedReaction: ITaskCommentReaction, key: QueryKey) {
    this.queryClient?.setQueryData<ITaskComment[]>(key, (old = []) =>
      old.map((c) =>
        c.id === removedReaction.commentId
          ? {
              ...c,
              reactions: c.reactions.filter((r) => r.id !== removedReaction.id)
            }
          : c
      )
    )
  }

  private handleTagsUpdate(updateTask: IWebSocketTaskTag, originalTask: Task) {
    const tagEvent = updateTask.tags
    if (tagEvent.add) {
      this.taskStore.addTag(originalTask, tagEvent.add)
    }

    if (tagEvent.delete) {
      this.taskStore.deleteTag(originalTask, tagEvent.delete)
    }
  }

  private handleObserversUpdate(updateTask: IWebSocketObserver, task: Task) {
    const observerEvent = updateTask.observers

    if (observerEvent.add) {
      this.taskStore.assignObserver([task, observerEvent.add[0]])
    }
    if (observerEvent.remove) {
      this.taskStore.reassignObserver([task, observerEvent.remove[0]])
    }
  }

  private handleFileUpdate(updateTask: IWebSocketTaskFile, task: Task) {
    const fileEvent = updateTask.file

    if (fileEvent.dateDeleted) {
      this.taskStore.deleteFile(task, fileEvent.id)
    } else {
      this.taskStore.addFileToTask(task, fileEvent)
    }
  }

  private handleAssignerUpdate(updateTask: TaskResponse, task: Task) {
    this.taskStore.changeAssigner([task, updateTask.assigner])
  }

  private handleSafeUpdate(updateTask: TaskResponse, originalTask: Task) {
    const { tags, id, projectId, ...safeUpdate } = updateTask

    const oldStatusId = originalTask.status.id

    this.recalculateTimer(updateTask, originalTask)

    runInAction(() => {
      Object.assign(originalTask, safeUpdate)
    })

    if (updateTask.statusId && updateTask.statusId !== oldStatusId) {
      const newStatus = this.projectStore.activeProject.statuses.find(
        (s) => String(s.id) === String(updateTask.statusId)
      )

      if (newStatus) {
        const statusChanger = new TaskStatusChanger(
          originalTask,
          this.taskStore
        )
        statusChanger.change(newStatus)
      }
    }
  }

  private async handleTaskCreate(createTask: TaskResponse) {
    try {
      const activeProject = this.projectStore.activeProject
      const dateCreated = createTask.dateCreated ?? new Date().toISOString()
      const externalId = createTask.externalId ?? ''

      const dto: TaskCreateRequest = {
        title: createTask.title,
        content: createTask.content ?? '',
        executorId: createTask.executor?.id,
        statusId: createTask.statusId,
        parentId: createTask.parentId,
        folderId: createTask.folderId ?? undefined,
        projectId: activeProject.id,
        sprintId: createTask.sprintId ?? undefined,
        priority: createTask.priority,
        deadlineDate: createTask.deadlineDate
          ? dayjs(createTask.deadlineDate).toDate()
          : undefined
      }

      await this.taskStore.create(createTask.id, dateCreated, externalId, dto)
    } catch (error) {
      console.error('Fail creating task from WS: ', error)
    }
  }

  private handleDeleteTask(deleteTask: TaskResponse, id: number) {
    let originalTask
    try {
      originalTask = this.taskStore.get(id)
    } catch {
      originalTask = this.taskStore.mapTaskDTOToTask(deleteTask)
      this.taskStore.addTask(originalTask)
    }

    this.taskStore.delete(originalTask)
  }

  private handleMoveTask(move: IWebsocketMoveTask, id: number) {
    if (move.folder) {
      const folderEvent = move.folder

      if (folderEvent.change) {
        const dto: TaskChangeFolderRequest = {
          taskId: id,
          folderId: folderEvent.change.newFolderId
        }
        this.folderStore.moveTaskToFolder(dto)
      } else if (folderEvent.remove) {
        this.folderStore.moveTaskToRoot(id)
      }
    } else if (move.task) {
      const taskEvent = move.task
      if (taskEvent.remove) {
        const dto: MoveTaskRequest = {
          taskId: id,
          taskFromId: taskEvent.remove.parentId,
          order: 1
        }

        this.taskStore.move(dto)
      } else if (taskEvent.change) {
        const dto: MoveTaskRequest = {
          taskId: id,
          taskFromId: taskEvent.change.oldTaskId,
          taskToId: taskEvent.change.newTaskId,
          order: 1
        }
        this.taskStore.move(dto)
      }
    }
  }

  private recalculateTimer(modifyTask: TaskResponse, originalTask: Task) {
    if (modifyTask.id !== originalTask.id) {
      return
    }

    if (modifyTask.activeDate) {
      originalTask.isTrackingByOtherUser = false
    } else if (originalTask.isTrackingByOtherUser && originalTask.activeDate) {
      originalTask.isTrackingByOtherUser = false
      // modifyTask.userSecondsTracked =
      //   originalTask.userSecondsTracked +
      //   Math.floor((Date.now() - Number(originalTask.activeDate)) / 1000)
    }
  }

  private handleFolderEvent(folderEvent: IFolderMessage) {
    const { create, delete: deleteFolder, id, update } = folderEvent

    if (create) {
      this.handleCreateFolder(create)
    }

    if (deleteFolder) {
      const folder = this.folderStore.get(id)
      this.folderStore.delete(folder)
    }

    if (update) {
      const dto = { ...update, id }
      this.folderStore.update(dto)
    }
  }

  private handleCreateFolder(create: IFolderDTO) {
    const createdRecord: ICreatedRecord = {
      id: create.id,
      uuid: '',
      title: create.title,
      dateCreated: create.dateCreated,
      externalId: ''
    }

    const createFolderDto: ICreateFolderDTO = {
      title: create.title,
      projectId: create.projectId,
      parentId: create.parentId
    }

    this.folderStore.create(createdRecord, createFolderDto)

    const targetProject = this.projectStore.get(create.projectId)
    targetProject.folderCount++
  }

  private handleSprintEvent(sprintEvent: ISprintMessage) {
    const { create, id, delete: deleteSprint, update, tasks } = sprintEvent

    if (create) return this.handleCreateSprint(create, id)

    if (deleteSprint) return this.handleDeleteSprint(id)

    if (update) return this.handleUpdateSprint(update, id)

    if (tasks) return this.handleUpdateSprintTasks(tasks, id)
  }

  private handleCreateSprint(
    createSprint: ISprintCreateDTO & { status: SprintStatuses },
    id: number
  ) {
    this.sprintStore.create(id, createSprint.status, {
      title: createSprint.title,
      dateStart: new Date(createSprint.dateStart),
      dateEnd: new Date(createSprint.dateEnd),
      projectId: createSprint.projectId
    })
  }

  private handleDeleteSprint(id: number) {
    this.sprintStore.deleteSprint(id)
  }

  private handleUpdateSprint(update: ISprintUpdateDTO, id: number) {
    this.sprintStore.updateSprint(id, update)
  }

  private handleUpdateSprintTasks(tasks: ISprintUpdateTasks, id: number) {
    if (tasks.add) {
      this.sprintStore.addTasksToSprint(id, tasks.add)
    }
    if (tasks.remove) {
      this.sprintStore.removeTasksFromSprint(id, tasks.remove)
    }
  }

  private handleUpdateProjectStatus(statusMessage: IStatusMessage) {
    if (statusMessage.create) {
      this.projectStore.createTaskStatus({
        id: statusMessage.statusId,
        name: statusMessage.create.name,
        color: statusMessage.create.color,
        order: statusMessage.create.order,
        code: null
      })
    }
    if (statusMessage.update) {
      this.projectStore.updateTaskStatus({
        id: statusMessage.statusId,
        ...statusMessage.update
      })
    }
    if (statusMessage.delete) {
      const status = this.projectStore.getStatusById(statusMessage.statusId)
      this.projectStore.deleteTaskStatus(status)
    }
  }

  private handleReportEvent(
    update: IProjectReport,
    queryClient: QueryClient | null,
    projectId: number,
    isNotify: boolean
  ) {
    const project = this.projectStore.get(projectId)
    if (!queryClient) return

    if (update.dateCreated) {
      queryClient.setQueryData(
        reportsQueries.reports(project).queryKey,
        (old: IProjectReport[]) => (old ? [...old, update] : [update])
      )
      return
    }

    if (update.dateDeleted) {
      queryClient.setQueryData<IProjectReport[]>(
        reportsQueries.reports(project).queryKey,
        (old) => (old ? old.filter((r) => r.uuid !== update.uuid) : old)
      )
      return
    }

    queryClient.setQueryData(
      reportsQueries.reports(project).queryKey,
      (old: IProjectReport[]) =>
        old
          ? old.map((o) => {
              if (o.id === update.id) {
                return { ...o, ...update }
              }
              return o
            })
          : old
    )

    if (isNotify && update.status === ReportStatus.Completed) {
      showToast({
        title: i18next.t('report.generated.title', {
          ns: SUCCESS,
          title: update.title
        }),
        type: 'success',
        text: i18next.t('report.generated.text', { ns: SUCCESS }) as string
      })
    }

    if (isNotify && update.status === ReportStatus.Error) {
      showToast({
        title: i18next.t('report.generated', {
          ns: ERRORS,
          title: update.title
        }),
        type: 'error'
      })
    }
  }
}
