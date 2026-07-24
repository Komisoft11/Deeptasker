import { CreateTaskRequest, TaskResponse, UpdateTaskRequest } from '../dto'
import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common'
import { I18nContext, I18nService } from 'nestjs-i18n'
import type { Mapper } from '@automapper/core'
import { InjectMapper } from '@automapper/nestjs'
import { EventService } from '../../events/event.service'
import { ProjectService } from '../../project/services/project/project.service'
import { getCurrentUTCDateTime } from '../../common/helpers/date'
import { UserService } from '../../user/user.service'
import type { ITaskRepository } from '../repositories/task/task-repository.interface'
import { TASK_REPOSITORY } from '../repositories/task/task-repository.interface'
import { TaskModel } from '../models/task.model'
import { TimerService } from '../timer/timer.service'
import { ProjectModel } from '../../project/models/project.model'
import { MyBaseModel } from '../../common/database/base.model'
import { TransactionOrKnex } from 'objection'
import { UserModel } from '../../user/models/user.model'
import { TaskStatusService } from '../../project/services/task-status/task-status.service'
import { SpecialTaskStatusCode, TaskStatusModel } from '../models/task-status.model'
import { TaskOrderProducerService } from '../../async-job/task/order/task-order.producer.service'
import { TaskMover } from '../components/task-mover'
import { MoveDto } from '../../common/dto/move.dto'
import { TaskHistoryField, TaskHistoryService } from './task-history.service'
import { WorkspaceModel } from '../../workspace/models/workspace.model'
import { TaskCommentModel } from '../comment/models/task-comment.model'
import { FolderModel } from '../../folder/model/folder.model'
import { SprintService } from '../../sprint/sprint.service'
import { TaskTagService } from '../tag/services/task-tag.service'
import { REG_EXP_AVAILABLE_DUPLICATE_TITLE } from '../../common/const/const'
import { TaskUpdater } from '../components/task-updater/task-updater'
import { TaskCacheService } from '../../cache/services/task.cache-service'
import { NotificationService } from '../../notification/notification.service'

export interface ITaskStatusChange {
  oldStatusId?: number
  newStatusId?: number
  newOrder?: number
  oldOrder?: number
}

interface DuplicateTaskDto {
  originalTask: TaskModel
  statusId: number
  parentId?: number
}

@Injectable()
export class TaskService {
  constructor(
    @Inject(TASK_REPOSITORY) private readonly taskRepository: ITaskRepository,
    @InjectMapper() private readonly mapper: Mapper,
    private i18n: I18nService,
    private readonly eventService: EventService,
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
    @Inject(forwardRef(() => ProjectService)) private readonly projectService: ProjectService,
    private readonly timerService: TimerService,
    @Inject(forwardRef(() => TaskStatusService))
    private readonly taskStatusService: TaskStatusService,
    private taskOrderService: TaskOrderProducerService,
    private taskMover: TaskMover,
    private historyService: TaskHistoryService,
    private readonly sprintService: SprintService,
    private readonly tagService: TaskTagService,
    private readonly taskUpdater: TaskUpdater,
    private readonly tasksCacheService: TaskCacheService,
    private readonly messagingService: NotificationService
  ) {}

  public async create(
    createTaskDto: CreateTaskRequest,
    project: ProjectModel,
    user: UserModel,
    transaction?: TransactionOrKnex
  ): Promise<TaskModel> {
    const trx = await MyBaseModel.startTransaction(transaction)

    try {
      const statusId = await this.determineTaskStatus(createTaskDto, project, trx)

      const task = await this.taskRepository.createTask(
        createTaskDto,
        user.id,
        project.id,
        statusId,
        trx
      )

      await trx.commit()

      await this.tasksCacheService.delete(project.id)

      this.sendTaskCreatedEvent(task, project.id, user)

      await this.handleTaskRelationships(createTaskDto, task, user)

      return task
    } catch (e) {
      await trx.rollback()
      console.error(e)
      throw e
    }
  }

  public async update(
    task: TaskModel,
    updateTaskDto: UpdateTaskRequest,
    user: UserModel,
    trx?: TransactionOrKnex
  ): Promise<void> {
    await this.taskUpdater.update(task, updateTaskDto, user, trx)

    await this.tasksCacheService.delete(task.projectId)

    this.eventService
      .sendEvent({
        project: {
          id: task.projectId,
          task: {
            id: task.id,
            update: {
              ...updateTaskDto
            }
          }
        },
        userId: user.id
      })
      .then()
      .catch(e => {
        console.error(e)
      })
  }

  public async sentForReview(task: TaskModel, user: UserModel): Promise<void> {
    if (!(await this.isAllSubTasksFinished(task))) {
      throw new NotFoundException(
        this.i18n.t('task.you_can_not_sent_task_to_review_you_have_to_finish_all_subtasks', {
          lang: I18nContext.current().lang,
          args: { taskId: task.id }
        })
      )
    }

    const trx = await MyBaseModel.startTransaction()

    try {
      const newStatus = await this.taskStatusService.getSpecialStatus(
        task.projectId,
        SpecialTaskStatusCode.review,
        trx
      )

      const oldStatus = await this.taskRepository.getStatus(task)

      const isChangedExecutor = !task.executorId

      await Promise.all([
        this.taskRepository.updateTaskFields(
          task,
          {
            dateSentForReview: getCurrentUTCDateTime(),
            executorId: isChangedExecutor ? user.id : undefined,
            statusId: newStatus.id
          },
          trx
        ),
        this.historyService.recordHistory(
          task.id,
          {
            field: TaskHistoryField.status,
            oldValue: oldStatus.name,
            newValue: newStatus.name
          },
          user.id,
          trx
        ),
        isChangedExecutor
          ? this.historyService.recordHistory(
              task.id,
              {
                field: TaskHistoryField.executor,
                oldValue: null,
                newValue: JSON.stringify({ id: user.id, name: user.fullName })
              },
              user.id,
              trx
            )
          : null
      ])

      const project = await this.taskRepository.getProject(task)
      const workspace = await this.taskRepository.getWorkspace(task)

      await this.messagingService.publishNotification({
        type: 'PUBLISH_DOMESTIC_NOTIFICATION',
        recipient: { userId: task.assignerId },
        sender: { userId: user.id },
        payload: {
          message: {
            workspace: {
              id: workspace.id,
              name: workspace.title
            },
            project: {
              id: project.id,
              workspaceId: project.workspaceId,
              name: project.title,
              slug: project.slug
            },
            task: {
              id: task.id,
              externalId: task.externalId,
              name: task.title,
              update: {
                execute: {
                  executor: {
                    id: user.id,
                    name: user.fullName
                  }
                }
              }
            }
          }
        }
      })

      await trx.commit()

      await this.tasksCacheService.delete(task.projectId)

      this.eventService
        .sendEvent({
          project: {
            id: task.projectId,
            task: {
              id: task.id,
              update: {
                dateSentForReview: task.dateSentForReview,
                statusId: newStatus.id
              }
            }
          },
          userId: user.id
        })
        .then()
        .catch(e => {
          console.error(e)
        })
    } catch (e) {
      console.error(e)
      await trx.rollback()
      throw e
    }
  }

  public async cancelReview(task: TaskModel, user: UserModel): Promise<void> {
    const trx = await MyBaseModel.startTransaction()

    try {
      const newStatusId = await this.taskStatusService.getSpecialStatusId(
        task.projectId,
        SpecialTaskStatusCode.process,
        trx
      )

      await this.taskRepository.updateTaskFields(
        task,
        {
          dateSentForReview: null,
          executorId: task.executorId,
          statusId: newStatusId
        },
        trx
      )

      const project = await this.taskRepository.getProject(task)
      const workspace: WorkspaceModel = await this.taskRepository.getWorkspace(task)

      await trx.commit()

      await this.messagingService.publishNotification({
        type: 'PUBLISH_DOMESTIC_NOTIFICATION',
        recipient: { userId: task.assignerId },
        sender: { userId: user.id },
        payload: {
          message: {
            workspace: {
              id: workspace.id,
              name: workspace.title
            },
            project: {
              id: project.id,
              workspaceId: project.workspaceId,
              name: project.title,
              slug: project.slug
            },
            task: {
              id: task.id,
              externalId: task.externalId,
              name: task.title,
              update: {
                cancelReview: {
                  executor: {
                    id: user.id,
                    name: user.fullName
                  }
                }
              }
            }
          }
        }
      })

      await this.tasksCacheService.delete(task.projectId)

      this.eventService
        .sendEvent({
          project: {
            id: task.projectId,
            task: {
              id: task.id,
              update: {
                dateSentForReview: null,
                statusId: newStatusId
              }
            }
          },
          userId: user.id
        })
        .then()
        .catch(e => {
          console.error(e)
        })
    } catch (e) {
      console.error(e)
      await trx.rollback()
      throw e
    }
  }

  public async confirm(task: TaskModel, user: UserModel): Promise<void> {
    const trx = await MyBaseModel.startTransaction()

    try {
      const newStatusId = await this.taskStatusService.getSpecialStatusId(
        task.projectId,
        SpecialTaskStatusCode.executed,
        trx
      )

      await this.taskRepository.updateTaskFields(
        task,
        {
          dateFinished: getCurrentUTCDateTime(),
          statusId: newStatusId
        },
        trx
      )

      const project = await this.taskRepository.getProject(task)
      const workspace: WorkspaceModel = await this.taskRepository.getWorkspace(task)

      if (task.executorId && task.executorId !== user.id) {
        await this.messagingService.publishNotification({
          type: 'PUBLISH_DOMESTIC_NOTIFICATION',
          recipient: { userId: task.executorId },
          sender: { userId: user.id },
          payload: {
            message: {
              workspace: {
                id: workspace.id,
                name: workspace.title
              },
              project: {
                id: project.id,
                workspaceId: project.workspaceId,
                name: project.title,
                slug: project.slug
              },
              task: {
                id: task.id,
                externalId: task.externalId,
                name: task.title,
                update: {
                  confirm: {
                    confirmer: {
                      id: user.id,
                      name: user.fullName
                    }
                  }
                }
              }
            }
          }
        })
      }

      await trx.commit()

      await this.tasksCacheService.delete(task.projectId)

      this.eventService
        .sendEvent({
          project: {
            id: task.projectId,
            task: {
              id: task.id,
              update: {
                dateFinished: task.dateFinished,
                statusId: newStatusId
              }
            }
          },
          userId: user.id
        })
        .then()
        .catch(e => {
          console.error(e)
        })
    } catch (e) {
      console.error(e)
      await trx.rollback()
      throw e
    }
  }

  public async finish(
    task: TaskModel,
    user: UserModel,
    finishedAt: Date,
    transaction?: TransactionOrKnex
  ): Promise<void> {
    const trx = await MyBaseModel.startTransaction(transaction)

    try {
      await this.timerService.stop(task.id, finishedAt, user, trx)

      await Promise.all([
        this.setAsFinishedTask(task, user, finishedAt, trx),
        this.findAndSetAsFinishedSubTasks(task, task, user, finishedAt, trx)
      ])

      await trx.commit()

      await this.tasksCacheService.delete(task.projectId)
    } catch (e) {
      console.error(e)
      await trx.rollback()
      throw e
    }
  }

  public async backToWork(
    taskId: number,
    user: UserModel,
    transaction?: TransactionOrKnex
  ): Promise<void> {
    const task = await this.getTask(taskId)

    const trx = await MyBaseModel.startTransaction(transaction)
    try {
      await Promise.all([
        this.setAsUnFinishedTask(task, user, trx),
        this.findAndSetAsUnFinishedSubTasks(task, user, trx)
      ])

      await trx.commit()

      await this.tasksCacheService.delete(task.projectId)
    } catch (e) {
      await trx.rollback()
      throw e
    }

    return this.eventService
      .sendEvent({
        project: {
          id: task.projectId,
          task: {
            id: task.id,
            update: {
              statusId: task.statusId
            }
          }
        },
        userId: user.id
      })
      .then()
      .catch(e => {
        console.error(e)
      })
  }

  public async delete(task: TaskModel, deletedAt: Date, user: UserModel, em?: TransactionOrKnex) {
    const trx = await MyBaseModel.startTransaction(em)

    try {
      await this.deleteSubTasks(task.id, deletedAt, user, trx)

      await this.timerService.stop(task.id, deletedAt, user, trx)

      await this.taskRepository.deleteTask(task.id, trx)

      await trx.commit()

      await this.tasksCacheService.delete(task.projectId)

      this.sendTaskDeleteEvent(task, task.projectId, user)
    } catch (e) {
      console.error(e)
      await trx.rollback()
      throw e
    }
  }

  public async sendTaskDeleteEvent(task: TaskModel, projectId: number, user: UserModel) {
    return this.eventService
      .sendEvent({
        project: {
          id: projectId,
          task: {
            id: task.id,
            delete: {
              dateDeleted: task.dateDeleted
            }
          }
        },
        userId: user.id
      })
      .then()
      .catch(e => {
        console.error(e)
      })
  }

  private async deleteSubTasks(
    taskId: number,
    deletedAt: Date,
    user: UserModel,
    em: TransactionOrKnex = null
  ) {
    const task = await this.getTask(taskId, em)

    await this.taskRepository.deleteSubTasks(taskId, em)

    await this.stopWithoutChecks(task, user, deletedAt, em)
  }

  public async getFullTask(taskId: number): Promise<TaskModel> {
    return this.taskRepository.getFullTask(taskId)
  }

  public async getTask(id: number, trx?: TransactionOrKnex): Promise<TaskModel> {
    const task = await this.taskRepository.getTask(id, trx)

    if (!task) {
      throw new NotFoundException(
        this.i18n.t('task.not_found', { lang: I18nContext.current().lang, args: { id: id } })
      )
    }

    return task
  }

  public async getTaskByExternalId(
    workspaceId: number,
    projectSlug: string,
    externalId: string,
    trx?: TransactionOrKnex
  ): Promise<TaskModel> {
    const project = await this.projectService.getBySlugInWorkspace(workspaceId, projectSlug)
    const task = await this.taskRepository.getTaskByExternalId(project.id, externalId, trx)

    if (!task) {
      throw new NotFoundException(
        this.i18n.t('task.not_found', {
          lang: I18nContext.current().lang,
          args: { id: externalId }
        })
      )
    }

    return task
  }

  public async getTasksByProject(project: ProjectModel): Promise<TaskResponse[]> {
    const cached = await this.tasksCacheService.get(project.id)

    if (cached) {
      return cached
    }

    const tasks = await this.taskRepository.getTasksByProject(project)

    await Promise.allSettled(
      tasks.flatMap(task => [task.loadCommentsCount(), task.loadFilesCount()])
    )

    const dto = this.mapper.mapArray(tasks, TaskModel, TaskResponse)

    await this.tasksCacheService.set(project.id, dto)

    return dto
  }

  public async getTaskDtoShort(task: TaskModel): Promise<TaskResponse> {
    await this.taskRepository.fetchGraph(
      task,
      '[user(selectShort), assigner(selectShort), executor(selectShort), subtasks(selectId,notDeleted)]'
    )

    return this.mapper.map(task, TaskModel, TaskResponse)
  }

  public async findAndSetAsUnFinishedSubTasks(
    task: TaskModel,
    user: UserModel,
    trx?: TransactionOrKnex
  ) {
    const finishedTasks = await this.taskRepository.getFinishedTasksByTask(task.id, trx)

    if (finishedTasks.length === 0) {
      return
    }

    await Promise.all(finishedTasks.map(task => this.setAsUnFinishedTask(task, user, trx)))
  }

  public async assign(
    task: TaskModel,
    executorId: number,
    assignedAt: Date,
    user: UserModel,
    transaction?: TransactionOrKnex
  ): Promise<void> {
    if (task.executorId === executorId) {
      throw new BadRequestException(`User ${executorId} already assigned to task ${task.id}`)
    }

    const userToAssign = await this.userService.getUser(executorId)

    const trx = await MyBaseModel.startTransaction(transaction)
    try {
      // give partial project access if user does not have direct access to task's project
      if (!(await this.projectService.hasProjectAccess(userToAssign, task.projectId))) {
        throw new ForbiddenException(
          this.i18n.t('task.assign.user_no_access_to_project', {
            lang: I18nContext.current().lang
          })
        )
      }

      const oldExecutor = await this.taskRepository.getExecutor(task, trx)
      const project = await this.taskRepository.getProject(task, trx)
      const workspace = await this.taskRepository.getWorkspace(task, trx)

      await Promise.all([
        // stop timer if started by existing executor
        oldExecutor ? this.timerService.stop(task.id, assignedAt, user, trx) : null,

        // notification for new executor
        this.messagingService.publishNotification({
          type: 'PUBLISH_DOMESTIC_NOTIFICATION',
          recipient: { userId: executorId },
          sender: { userId: user.id },
          payload: {
            message: {
              workspace: {
                id: workspace.id,
                name: workspace.title
              },
              project: {
                id: project.id,
                workspaceId: project.workspaceId,
                name: project.title,
                slug: project.slug
              },
              task: {
                id: task.id,
                externalId: task.externalId,
                name: task.title,
                update: {
                  isExecutor: true
                }
              }
            }
          }
        }),

        // notification for old executor
        oldExecutor
          ? this.messagingService.publishNotification({
              type: 'PUBLISH_DOMESTIC_NOTIFICATION',
              recipient: { userId: oldExecutor.id },
              sender: { userId: user.id },
              payload: {
                message: {
                  workspace: {
                    id: workspace.id,
                    name: workspace.title
                  },
                  project: {
                    id: project.id,
                    workspaceId: project.workspaceId,
                    name: project.title,
                    slug: project.slug
                  },
                  task: {
                    id: task.id,
                    externalId: task.externalId,
                    name: task.title,
                    update: {
                      removeFromExecutor: true
                    }
                  }
                }
              }
            })
          : null
      ])

      await Promise.all([
        this.taskRepository.changeExecutor(task, executorId, trx),
        this.historyService.recordHistory(
          task.id,
          {
            field: TaskHistoryField.executor,
            oldValue: oldExecutor
              ? JSON.stringify({ id: oldExecutor.id, name: oldExecutor.fullName })
              : null,
            newValue: JSON.stringify({ id: userToAssign.id, name: userToAssign.fullName })
          },
          user.id,
          trx
        )
      ])

      await trx.commit()
    } catch (e) {
      console.error(e)
      await trx.rollback()
      throw e
    }

    this.eventService
      .sendEvent({
        userId: user.id,
        project: {
          id: task.projectId,
          task: {
            id: task.id,
            update: {
              executor: userToAssign.getShortInfo()
            }
          }
        }
      })
      .then(() => {})
      .catch(e => {
        console.error(e)
      })
  }

  public async changeAssigner(
    task: TaskModel,
    assignerId: number,
    user: UserModel,
    transaction?: TransactionOrKnex
  ): Promise<void> {
    if (task.assignerId === assignerId) {
      throw new BadRequestException(`User ${assignerId} already assigner of task ${task.id}`)
    }

    const newAssigner = await this.userService.getUser(assignerId)

    const trx = await MyBaseModel.startTransaction(transaction)
    try {
      // give partial project access if user does not have direct access to task's project
      if (!(await this.projectService.hasProjectAccess(newAssigner, task.projectId))) {
        throw new ForbiddenException(
          this.i18n.t('task.assign.user_no_access_to_project', {
            lang: I18nContext.current().lang
          })
        )
      }

      const oldAssigner = await this.taskRepository.getAssigner(task, trx)
      const project = await this.taskRepository.getProject(task, trx)
      const workspace = await this.taskRepository.getWorkspace(task, trx)

      await Promise.all([
        // notification for new assigner
        await this.messagingService.publishNotification({
          type: 'PUBLISH_DOMESTIC_NOTIFICATION',
          recipient: { userId: assignerId },
          sender: { userId: user.id },
          payload: {
            message: {
              workspace: {
                id: workspace.id,
                name: workspace.title
              },
              project: {
                id: project.id,
                workspaceId: project.workspaceId,
                name: project.title,
                slug: project.slug
              },
              task: {
                id: task.id,
                externalId: task.externalId,
                name: task.title,
                update: {
                  isAssigner: true
                }
              }
            }
          }
        }),

        // notification for old assigner
        oldAssigner
          ? this.messagingService.publishNotification({
              type: 'PUBLISH_DOMESTIC_NOTIFICATION',
              recipient: { userId: oldAssigner.id },
              sender: { userId: user.id },
              payload: {
                message: {
                  workspace: {
                    id: workspace.id,
                    name: workspace.title
                  },
                  project: {
                    id: project.id,
                    workspaceId: project.workspaceId,
                    name: project.title,
                    slug: project.slug
                  },
                  task: {
                    id: task.id,
                    externalId: task.externalId,
                    name: task.title,
                    update: {
                      removeFromAssigner: true
                    }
                  }
                }
              }
            })
          : null
      ])

      await Promise.all([
        // change assigner
        this.taskRepository.updateTaskFields(
          task,
          {
            assignerId: newAssigner.id
          },
          trx
        ),
        // record history
        this.historyService.recordHistory(
          task.id,
          {
            field: TaskHistoryField.assigner,
            oldValue: oldAssigner
              ? JSON.stringify({ id: oldAssigner.id, name: oldAssigner.fullName })
              : null,
            newValue: JSON.stringify({ id: newAssigner.id, name: newAssigner.fullName })
          },
          user.id,
          trx
        )
      ])

      await trx.commit()

      this.eventService
        .sendEvent({
          userId: user.id,
          project: {
            id: task.projectId,
            task: {
              id: task.id,
              update: {
                assigner: newAssigner.getShortInfo()
              }
            }
          }
        })
        .then(() => {})
        .catch(e => {
          console.error(e)
        })
    } catch (e) {
      console.error(e)
      await trx.rollback()
      throw e
    }
  }

  public async removeExecutorWithStatusChange(task: TaskModel, removedAt: Date, user: UserModel) {
    const statusId = await this.taskStatusService.getSpecialStatusId(
      task.projectId,
      SpecialTaskStatusCode.open
    )

    const trx = await MyBaseModel.startTransaction()

    try {
      const oldExecutor = await this.taskRepository.getExecutor(task)

      if (oldExecutor?.id) {
        await this.timerService.stop(task.id, removedAt, oldExecutor, trx)
      }

      await Promise.all([
        this.removeExecutor(task, trx),
        this.taskRepository.simpleUpdateStatus(task, statusId, trx),
        this.historyService.recordHistory(
          task.id,
          {
            field: TaskHistoryField.executor,
            oldValue: JSON.stringify({ id: oldExecutor.id, name: oldExecutor.fullName }),
            newValue: null
          },
          user.id,
          trx
        )
      ])

      await trx.commit()

      this.eventService
        .sendEvent({
          userId: user.id,
          project: {
            id: task.projectId,
            task: {
              id: task.id,
              update: {
                executor: null,
                statusId: statusId
              }
            }
          }
        })
        .catch(e => {
          console.error(e)
        })
    } catch (e) {
      await trx.rollback()
      console.error(e)
      throw e
    }
  }

  public async removeExecutor(task: TaskModel, trx?: TransactionOrKnex) {
    await this.taskRepository.updateTaskFields(
      task,
      {
        executorId: null
      },
      trx
    )
  }

  public async moveByQueue(task: TaskModel, moveDto: MoveDto, userId: number) {
    if (moveDto.newParentId && (await this.hasDescendant(task.id, moveDto.newParentId))) {
      throw new BadRequestException(
        this.i18n.t('task.move.task_has_ancestor', {
          lang: I18nContext.current().lang,
          args: { id: task.id, ancestorId: moveDto.newParentId }
        })
      )
    }

    await this.taskOrderService.changeOrder({ ...moveDto, taskId: task.id, userId, type: 'move' })

    if (moveDto.newParentId) {
      this.eventService
        .sendEvent({
          userId: userId,
          project: {
            id: task.projectId,
            task: {
              id: task.id,
              move: {
                task: {
                  change: {
                    newTaskId: moveDto.newParentId,
                    oldTaskId: task.parentId
                  }
                }
              }
            }
          }
        })
        .then()
        .catch(e => {
          console.error(e)
        })
    } else {
      this.eventService
        .sendEvent({
          userId: userId,
          project: {
            id: task.projectId,
            task: {
              id: task.id,
              move: {
                task: {
                  remove: {
                    parentId: moveDto.parentId
                  }
                }
              }
            }
          }
        })
        .then()
        .catch(e => {
          console.error(e)
        })
    }
  }

  public async move(task: TaskModel, moveDto: MoveDto, trx?: TransactionOrKnex) {
    if (moveDto.newParentId && (await this.hasDescendant(task.id, moveDto.newParentId))) {
      throw new BadRequestException(
        this.i18n.t('task.move.task_has_ancestor', {
          lang: I18nContext.current().lang,
          args: { id: task.id, ancestorId: moveDto.newParentId }
        })
      )
    }

    await this.taskMover.move(task, moveDto, trx)
  }

  public async trackingTask(user: UserModel): Promise<TaskModel> {
    if (!user.activeTaskId) {
      return null
    }

    const task = await this.taskRepository.getFullTask(user.activeTaskId)

    task.project = await this.projectService.get(task.projectId)

    return task
  }

  public async changeProject(task: TaskModel, project: ProjectModel, user: UserModel) {
    const oldProjectId = task.projectId

    if (oldProjectId === project.id) {
      throw new BadRequestException('Moving to same project')
    }

    const trx = await MyBaseModel.startTransaction()

    try {
      await this.changeProjectDeep(task, project, user, trx)

      await this.taskMover.topInNewProject(task, oldProjectId, project.id, trx)

      await trx.commit()
    } catch (e) {
      console.error(e)
      await trx.rollback()
    }

    this.sendTaskDeleteEvent(task, oldProjectId, user)
    this.sendTaskCreatedEvent(task, project.id, user)
  }

  public async changeProjectDeep(
    task: TaskModel,
    project: ProjectModel,
    user: UserModel,
    trx: TransactionOrKnex
  ) {
    const newStatus = await this.getTaskStatusForNewProject(task, project)

    const oldProject = await this.taskRepository.getProject(task, trx)

    if (task.folderId) {
      await this.taskRepository.removeFolder(task, trx)
    }

    await Promise.all([
      this.taskRepository.updateTaskFields(
        task,
        { projectId: project.id, statusId: newStatus.id },
        trx
      ),
      this.historyService.recordHistory(
        task.id,
        {
          field: TaskHistoryField.project,
          oldValue: oldProject.title,
          newValue: project.title
        },
        user.id,
        trx
      )
    ])

    const subtasks = await this.taskRepository.getSubtasks(task, trx)

    if (subtasks.length) {
      await Promise.all(subtasks.map(t => this.changeProjectDeep(t, project, user, trx)))
    }
  }

  public async getTaskStatusForNewProject(
    task: TaskModel,
    newProject: ProjectModel
  ): Promise<TaskStatusModel | null> {
    const taskStatus = await this.taskRepository.getStatus(task)

    if (!taskStatus) {
      return null
    }

    let specialTaskStatusCode: SpecialTaskStatusCode

    if (taskStatus.code) {
      specialTaskStatusCode = taskStatus.code as SpecialTaskStatusCode
    } else if (task.dateFinished !== null) {
      specialTaskStatusCode = SpecialTaskStatusCode.executed
    } else if (task.executorId) {
      specialTaskStatusCode = SpecialTaskStatusCode.process
    } else {
      specialTaskStatusCode = SpecialTaskStatusCode.open
    }

    const newTaskStatus = await this.taskStatusService.getSpecialStatus(
      newProject.id,
      specialTaskStatusCode
    )

    if (!newTaskStatus) {
      throw new InternalServerErrorException(
        this.i18n.t('task.task_status_in_project_not_found', {
          lang: I18nContext.current().lang,
          args: { code: taskStatus.code, id: task.id }
        })
      )
    }

    return newTaskStatus
  }

  public async sendTaskCreatedEvent(task: TaskModel, projectId: number, user: UserModel) {
    const taskDto = await this.getTaskDtoShort(task)

    this.eventService
      .sendEvent({
        project: {
          id: projectId,
          task: { id: task.id, create: taskDto }
        },
        userId: user.id
      })
      .catch(e => {
        console.error(e)
      })
  }

  public async isAllSubTasksFinished(task: TaskModel): Promise<boolean> {
    const subtasks = await this.taskRepository.getSubtasks(task)

    return subtasks.every(subtask => subtask.dateFinished)
  }

  public async getTaskComment(
    taskCommentId: number,
    trx?: TransactionOrKnex
  ): Promise<TaskCommentModel> {
    const comment = this.taskRepository.getComment(taskCommentId, trx)

    if (!comment) {
      throw new NotFoundException('Task comment not found: ' + taskCommentId)
    }

    return comment
  }

  public async hasDescendant(taskId: number, ancestorId: number): Promise<boolean> {
    return this.taskRepository.hasAncestor(ancestorId, taskId)
  }

  public async changeFolder(task: TaskModel, folder: FolderModel, user: UserModel) {
    const trx = await MyBaseModel.startTransaction()
    try {
      await this.taskRepository.changeFolder(task.id, folder.id, trx)

      if (task.parentId) {
        await this.move(task, { customOrder: 1 }, trx)
      }

      await this.deepChangeChildrenFolder(task, folder, trx)

      trx.commit()

      this.eventService
        .sendEvent({
          userId: user.id,
          project: {
            id: task.projectId,
            task: {
              id: task.id,
              move: {
                folder: {
                  change: {
                    newFolderId: folder.id
                  }
                }
              }
            }
          }
        })
        .then()
        .catch(e => {
          console.error(e)
        })
    } catch (e) {
      await trx.rollback()
      console.error(e)
      throw e
    }
  }

  public async removeFolder(task: TaskModel, user: UserModel): Promise<void> {
    const oldFolderId = task.folderId
    await this.taskRepository.removeFolder(task)

    const subtasks = await this.taskRepository.getSubtasks(task)

    await Promise.all(subtasks.map(subtask => this.removeFolder(subtask, user)))

    this.eventService
      .sendEvent({
        userId: user.id,
        project: {
          id: task.projectId,
          task: {
            id: task.id,
            move: {
              folder: {
                remove: {
                  folderId: oldFolderId
                }
              }
            }
          }
        }
      })
      .then()
      .catch(e => {
        console.error(e)
      })
  }

  public async getByIds(tasksId: number[], projectId: number): Promise<TaskModel[]> {
    const tasks = await this.taskRepository.getByIds(tasksId, projectId)

    if (!tasks.length) {
      throw new NotFoundException(
        this.i18n.t('task.not_found', {
          lang: I18nContext.current().lang,
          args: { id: tasksId.join(', ') }
        })
      )
    }

    return tasks
  }

  public async updateTasksStatus(
    tasks: TaskModel[],
    targetStatusId: number,
    projectId: number,
    user: UserModel
  ): Promise<void> {
    const project = await this.projectService.get(projectId)
    const status = await this.taskStatusService.get(targetStatusId, projectId)

    const taskIds = tasks.map(task => task.id)

    await this.taskRepository.updateTasksStatus(taskIds, status.id)

    tasks.forEach(({ id }) => {
      this.eventService
        .sendEvent({
          project: {
            id: project.id,
            task: {
              id: id,
              update: {
                statusId: status.id
              }
            }
          },
          userId: user.id
        })
        .then()
        .catch(e => {
          console.error(e)
        })
    })
  }

  public async duplicateTasks(
    originalTasks: TaskModel[],
    statusId: number,
    transaction?: TransactionOrKnex
  ): Promise<TaskModel[]> {
    const trx = await MyBaseModel.startTransaction(transaction)

    try {
      const duplicatesTasks = []

      const sortedTasks = originalTasks.sort((a, b) => a.id - b.id)

      for (const originalTask of sortedTasks) {
        const duplicated = await this.duplicateTask(
          {
            originalTask,
            statusId
          },
          trx
        )
        duplicatesTasks.push(duplicated)
      }

      await trx.commit()

      return duplicatesTasks
    } catch (e) {
      console.error(e)
      await trx.rollback()
      throw e
    }
  }

  public async duplicateTasksByStatus(
    sourceStatus: TaskStatusModel,
    targetStatus: TaskStatusModel,
    trx: TransactionOrKnex
  ): Promise<TaskModel[]> {
    const sourceTasks = await this.taskRepository.getByStatus(sourceStatus.id, true)

    return this.duplicateTasks(sourceTasks, targetStatus.id, trx)
  }

  public async deleteTasksInStatus(
    statusId: number,
    deletedAt: Date,
    user: UserModel,
    trx: TransactionOrKnex
  ): Promise<void> {
    const tasks = await this.taskRepository.getByStatus(statusId, true)

    await Promise.all(tasks.map(task => this.delete(task, deletedAt, user, trx)))
  }

  public async updateObservers(
    task: TaskModel,
    observerIds: number[],
    user: UserModel,
    trx?: TransactionOrKnex
  ): Promise<void> {
    await Promise.all(
      observerIds.map(observerId => {
        if (!this.userService.isUserExists(observerId)) {
          throw new NotFoundException(
            this.i18n.t('user.not_found', {
              lang: I18nContext.current().lang,
              args: { id: observerId }
            })
          )
        }
      })
    )

    await this.taskRepository.updateObservers(task, observerIds, trx)
  }

  public async getTasksByStatus(sourceStatusId: number, projectId: number) {
    return this.taskRepository.getTasksStatus(sourceStatusId, projectId)
  }

  private async deepChangeChildrenFolder(
    task: TaskModel,
    folder: FolderModel,
    trx?: TransactionOrKnex
  ): Promise<void> {
    const subtasks = await this.taskRepository.getSubtasks(task, trx)

    await this.taskRepository.changeChildrenFolder(task.id, folder.id, trx)

    await Promise.all(subtasks.map(subtask => this.deepChangeChildrenFolder(subtask, folder, trx)))
  }

  // TODO: task and taskThatFinished should be the same, maybe refactor to enforce this
  private async findAndSetAsFinishedSubTasks(
    task: TaskModel,
    taskThatFinished: TaskModel,
    user: UserModel,
    finishedAt: Date,
    trx?: TransactionOrKnex
  ): Promise<void> {
    const unfinishedTasks = await this.taskRepository.getUnfinishedSubtasks(task.id, trx)

    if (unfinishedTasks.length === 0) {
      return
    }

    for (const unfinishedTask of unfinishedTasks) {
      await this.setAsFinishedTask(unfinishedTask, user, finishedAt, trx, taskThatFinished)
      await this.findAndSetAsFinishedSubTasks(
        unfinishedTask,
        taskThatFinished,
        user,
        finishedAt,
        trx
      )
    }
  }

  private async setAsFinishedTask(
    task: TaskModel,
    user: UserModel,
    finishedAt: Date,
    em: TransactionOrKnex,
    parentTask?: TaskModel
  ): Promise<void> {
    const [newStatus, oldStatus] = await Promise.all([
      this.taskStatusService.getSpecialStatus(task.projectId, SpecialTaskStatusCode.executed, em),
      this.taskRepository.getStatus(task)
    ])

    await Promise.all([
      this.taskRepository.updateTaskFields(
        task,
        {
          dateFinished: finishedAt,
          executorId: task.executorId ? undefined : user.id,
          statusId: newStatus.id,
          finishedByTaskId: parentTask?.id ?? null
        },
        em
      ),
      this.historyService.recordHistory(
        task.id,
        {
          field: TaskHistoryField.status,
          oldValue: oldStatus?.name,
          newValue: newStatus.name
        },
        user.id,
        em
      )
    ])

    return this.eventService
      .sendEvent({
        project: {
          id: task.projectId,
          task: {
            id: task.id,
            update: {
              dateFinished: task.dateFinished,
              statusId: newStatus.id
            }
          }
        },
        userId: user.id
      })
      .then()
      .catch(e => {
        console.error(e)
      })
  }

  private async setAsUnFinishedTask(
    task: TaskModel,
    user: UserModel,
    em: TransactionOrKnex
  ): Promise<void> {
    if (task.dateSentForReview && task.dateFinished) {
      throw new ForbiddenException(
        this.i18n.t(
          'task.you_can_not_back_task_to_work_because_it_is_already_confirmed_by_assigner',
          {
            lang: I18nContext.current().lang,
            args: { taskId: task.id, assignerName: task.assigner.fullName }
          }
        )
      )
    }

    const [oldStatus, openStatus] = await Promise.all([
      this.taskRepository.getStatus(task, em),
      this.taskStatusService.getSpecialStatus(task.projectId, SpecialTaskStatusCode.open, em)
    ])

    await Promise.all([
      this.taskRepository.setAsUnFinishedTask(task, openStatus.id, em),
      this.historyService.recordHistory(
        task.id,
        {
          field: TaskHistoryField.status,
          oldValue: oldStatus?.name,
          newValue: openStatus.name
        },
        user.id,
        em
      )
    ])

    this.eventService
      .sendEvent({
        project: {
          id: task.projectId,
          task: {
            id: task.id,
            update: {
              dateFinished: null
            }
          }
        },
        userId: user.id
      })
      .then()
      .catch(e => {
        console.error(e)
      })
  }

  private async stopWithoutChecks(
    task: TaskModel,
    user: UserModel,
    deletedAt: Date,
    trx?: TransactionOrKnex
  ): Promise<void> {
    await this.taskRepository.fetchGraph(task, 'subtasks(selectId,notDeleted)')

    for (const subTask of task.subtasks) {
      await Promise.all([
        this.timerService.stop(subTask.id, deletedAt, user, trx),
        this.stopWithoutChecks(subTask, user, deletedAt, trx)
      ])
    }
  }

  private async duplicateTask(dto: DuplicateTaskDto, trx: TransactionOrKnex) {
    const { userId, projectId } = dto.originalTask

    const originalTask = await this.taskRepository.fetchGraph(
      dto.originalTask,
      '[invited, tags, subtasks]'
    )

    const [user, duplicateDto, project] = await Promise.all([
      this.userService.getUser(userId),
      this.createTaskDuplicationDto(originalTask, trx, dto.parentId),
      this.projectService.get(projectId)
    ])

    duplicateDto.statusId = dto.statusId

    const duplicatedTask = await this.taskRepository.createTask(
      duplicateDto,
      user.id,
      project.id,
      dto.statusId,
      trx
    )

    await this.handleTaskRelationships(duplicateDto, duplicatedTask, user, trx)

    if (originalTask.subtasks.length) {
      duplicatedTask.subtasks = await Promise.all(
        originalTask.subtasks.map(subtask =>
          this.duplicateTask(
            {
              originalTask: subtask,
              statusId: dto.statusId,
              parentId: duplicatedTask.id
            },
            trx
          )
        )
      )
    }

    return duplicatedTask
  }

  private async createTaskDuplicationDto(
    originalTask: TaskModel,
    trx: TransactionOrKnex,
    parentId: number = null
  ): Promise<CreateTaskRequest> {
    const availableTitle = await this.getAvailableDuplicateTitle(
      originalTask.title,
      originalTask.projectId,
      trx
    )

    return {
      assignerId: originalTask.assignerId,
      observers: originalTask.invited.map(invited => invited.userId),
      sprintId: originalTask.sprintId,
      tags: originalTask.tags.map(tag => tag.id),
      title: availableTitle,
      projectId: originalTask.projectId,
      content: originalTask.content,
      statusId: originalTask.statusId,
      deadlineDate: originalTask.deadlineDate,
      priority: originalTask.priority,
      executorId: originalTask.executorId,
      folderId: originalTask.folderId,
      parentId: parentId
    }
  }

  private async getAvailableDuplicateTitle(
    title: string,
    projectId: number,
    trx: TransactionOrKnex
  ): Promise<string> {
    const match = title.match(REG_EXP_AVAILABLE_DUPLICATE_TITLE)

    let baseTitle = match[1].trim()
    let currentNumber = match[2] ? parseInt(match[2]) : 0

    let newTitle = title
    let attemptNumber = currentNumber + 1

    while (await this.taskRepository.isTitleExists(newTitle, projectId, trx)) {
      newTitle = `${baseTitle} [${attemptNumber}]`
      attemptNumber++
    }

    return newTitle
  }

  private async determineTaskStatus(
    createTaskDto: CreateTaskRequest,
    project: ProjectModel,
    transaction: TransactionOrKnex
  ): Promise<number> {
    if (createTaskDto.statusId) {
      return (await this.taskStatusService.get(createTaskDto.statusId, project.id)).id
    }

    return (
      (await this.taskStatusService.getSpecialStatusId(
        project.id,
        SpecialTaskStatusCode.open,
        transaction
      )) ?? (await this.taskStatusService.getOpenStatusId(project, transaction))
    )
  }

  private async handleTaskRelationships(
    createTaskDto: CreateTaskRequest,
    task: TaskModel,
    user: UserModel,
    transaction?: TransactionOrKnex
  ): Promise<void> {
    const trx = await MyBaseModel.startTransaction(transaction)

    try {
      await this.handleParentTask(createTaskDto, task, trx)
      await this.handleSprintAssignment(createTaskDto, task, trx, user)
      await this.handleAssigner(createTaskDto, task, user, trx)
      await this.handleObservers(createTaskDto, task, user, trx)
      await this.handleTags(createTaskDto, task, user, trx)

      await trx.commit()
    } catch (e) {
      await trx.rollback()
      throw e
    }
  }

  private async handleParentTask(
    createTaskDto: CreateTaskRequest,
    task: TaskModel,
    transaction: TransactionOrKnex
  ): Promise<void> {
    if (createTaskDto.parentId) {
      if (!(await this.taskRepository.isTaskExists(createTaskDto.parentId, transaction))) {
        console.error('Task parent not found: ' + createTaskDto.parentId)
        throw new NotFoundException(
          this.i18n.t('task.not_found', {
            lang: I18nContext.current().lang,
            args: { id: createTaskDto.parentId }
          })
        )
      }
    }

    if (createTaskDto.parentId) {
      await this.taskMover.move(
        task,
        { newParentId: createTaskDto.parentId, customOrder: 1 },
        transaction
      )
    } else {
      await this.taskMover.top(task, transaction)
    }
  }

  private async handleSprintAssignment(
    createTaskDto: CreateTaskRequest,
    task: TaskModel,
    transaction: TransactionOrKnex,
    user: UserModel
  ): Promise<void> {
    if (!createTaskDto.sprintId) return

    const sprint = await this.sprintService.get(createTaskDto.sprintId)

    if (!sprint) {
      throw new NotFoundException(
        this.i18n.t('sprint.not_found', {
          lang: I18nContext.current().lang,
          args: { id: createTaskDto.sprintId }
        })
      )
    }

    await this.sprintService.addTasks(sprint, { taskIds: [task.id] }, user, transaction)
  }

  private async handleAssigner(
    createTaskDto: CreateTaskRequest,
    task: TaskModel,
    user: UserModel,
    transaction: TransactionOrKnex
  ): Promise<void> {
    const assignerId = createTaskDto.assignerId ?? user.id
    await this.changeAssigner(task, assignerId, user, transaction)
  }

  private async handleObservers(
    createTaskDto: CreateTaskRequest,
    task: TaskModel,
    user: UserModel,
    transaction: TransactionOrKnex
  ): Promise<void> {
    if (createTaskDto.observers?.length > 0) {
      await this.updateObservers(task, createTaskDto.observers, user, transaction)
    }
  }

  private async handleTags(
    createTaskDto: CreateTaskRequest,
    task: TaskModel,
    user: UserModel,
    transaction: TransactionOrKnex
  ): Promise<void> {
    if (createTaskDto.tags?.length > 0) {
      const tags = await this.tagService.getByIds(createTaskDto.tags)
      await Promise.all(tags.map(tag => this.tagService.addToTask(task, tag, user, transaction)))
    }
  }
}
