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
import { EventService } from '../../../events/event.service'
import { ProjectModel } from '../../models/project.model'
import { CreateStatusDto } from '../../dto/task-status/in/create-status.dto'
import { SpecialTaskStatusCode, TaskStatusModel } from '../../../task/models/task-status.model'
import { generateRandomBgColor } from '../../../common/helpers/color'
import { MyBaseModel } from '../../../common/database/base.model'
import { TransactionOrKnex } from 'objection'
import { ICreatedRecord } from '../../../common/interfaces/created-record.interface'
import { UpdateStatusDto } from '../../dto/task-status/in/update-status.dto'
import { StatusMover } from '../../components/status-mover'
import {
  ITaskStatusRepository,
  TASK_STATUS_REPOSITORY
} from '../../repositories/task-status/task-status-repository.interface'
import { TaskDefaultStatusData } from '../../interfaces/task-status.interface'
import { TaskService } from '../../../task/services/task.service'
import { UserModel } from '../../../user/models/user.model'
import { TaskModel } from '../../../task/models/task.model'
import { REG_EXP_AVAILABLE_DUPLICATE_TITLE } from '../../../common/const/const'
import { CreateDuplicateTaskStatusDto } from '../../dto/task-status/in/create-duplicate-task-status.dto'
import { ProjectCacheService } from '../../../cache/services/project.cache-service'
import { ProjectService } from '../project/project.service'

@Injectable()
export class TaskStatusService {
  constructor(
    private i18n: I18nService,
    private statusMover: StatusMover,
    @Inject(TASK_STATUS_REPOSITORY) private readonly taskStatusRepository: ITaskStatusRepository,
    private eventService: EventService, // TODO trigger event
    @Inject(forwardRef(() => TaskService)) private readonly taskService: TaskService,
    @Inject(forwardRef(() => ProjectService)) private readonly projectService: ProjectService,
    private readonly projectCacheService: ProjectCacheService
  ) {}

  public async create(
    project: ProjectModel,
    createStatusDto: CreateStatusDto,
    user: UserModel,
    trx?: TransactionOrKnex
  ): Promise<TaskStatusModel> {
    const data: TaskDefaultStatusData = {
      name: createStatusDto.name,
      order: (await this.statusMover.getLastOrder(project)) + 1,
      color: createStatusDto.color ?? generateRandomBgColor()
    }

    const status = await this.taskStatusRepository.createTaskStatus(data, project.id, trx)

    await this.projectCacheService.deleteSingleProject(project.workspaceId, project.id)

    this.eventService.sendEvent({
      userId: user.id,
      project: {
        id: project.id,
        status: {
          id: status.id,
          create: {
            name: status.name,
            color: status.color,
            order: status.order
          }
        }
      }
    })

    return status
  }

  public async update(
    taskStatus: TaskStatusModel,
    updateStatusDto: UpdateStatusDto,
    user: UserModel,
    transaction?: TransactionOrKnex
  ): Promise<TaskStatusModel> {
    const trx = await MyBaseModel.startTransaction(transaction)
    try {
      await this.taskStatusRepository.updateTaskStatus(taskStatus, updateStatusDto, transaction)

      if (updateStatusDto.order && taskStatus.order !== updateStatusDto.order) {
        await this.statusMover.moveStatuses(taskStatus, updateStatusDto.order, trx)
      }

      await trx.commit()

      const project = await this.projectService.get(taskStatus.projectId)
      await this.projectCacheService.deleteSingleProject(project.workspaceId, project.id)

      this.eventService.sendEvent({
        userId: user.id,
        project: {
          id: project.id,
          status: {
            id: taskStatus.id,
            update: {
              name: updateStatusDto.name,
              color: updateStatusDto.color
            }
          }
        }
      })

      return taskStatus
    } catch (e) {
      await trx.rollback()
      console.error(e)
      throw e
    }
  }

  public async deleteStatus(
    project: ProjectModel,
    statusId: number,
    deletedAt: Date,
    user: UserModel
  ) {
    const status = await this.taskStatusRepository.getTaskStatusById(statusId)

    if (!status) {
      throw new NotFoundException(
        this.i18n.t('task_status.cannot_find_status_in_project', {
          lang: I18nContext.current().lang,
          args: { projectId: project.id }
        })
      )
    }

    if (status.code) {
      throw new BadRequestException(
        this.i18n.t('task_status.default_status_cannot_be_deleted', {
          lang: I18nContext.current().lang,
          args: { statusName: status.name }
        })
      )
    }

    const trx = await MyBaseModel.startTransaction()

    try {
      await this.taskService.deleteTasksInStatus(statusId, deletedAt, user, trx)

      await this.taskStatusRepository.deleteStatus(status.id, trx)

      await this.statusMover.reorderStatusesAfterDelete(project.id, status.order, trx)

      await trx.commit()

      await this.projectCacheService.deleteSingleProject(project.workspaceId, project.id)

      this.eventService.sendEvent({
        userId: user.id,
        project: {
          id: project.id,
          status: {
            id: status.id,
            delete: {
              dateDeleted: deletedAt
            }
          }
        }
      })
    } catch (e) {
      await trx.rollback()
      console.error(e)
      throw new BadRequestException(e)
    }
  }

  public async createOpenStatus(
    project: ProjectModel,
    trx?: TransactionOrKnex
  ): Promise<TaskStatusModel> {
    return this.taskStatusRepository.createTaskStatus(this.getDefaultOpenStatus(), project.id, trx)
  }

  public async createReviewStatus(
    project: ProjectModel,
    trx?: TransactionOrKnex
  ): Promise<TaskStatusModel> {
    return this.taskStatusRepository.createTaskStatus(
      this.getDefaultReviewStatus(),
      project.id,
      trx
    )
  }

  public async createDefaultStatuses(
    project: ProjectModel,
    trx?: TransactionOrKnex
  ): Promise<TaskStatusModel[]> {
    const statuses = this.getDefaultStatuses()

    return Promise.all(
      statuses.map(data => this.taskStatusRepository.createTaskStatus(data, project.id, trx))
    )
  }

  public async getStatuses(project: ProjectModel): Promise<TaskStatusModel[]> {
    return this.taskStatusRepository.getStatuesByProject(project)
  }

  public async projectHasStatusId(projectId: number, statusId: number): Promise<boolean> {
    return this.taskStatusRepository.projectHasStatusId(projectId, statusId)
  }

  public async getSpecialStatusId(
    projectId: number,
    code: SpecialTaskStatusCode,
    trx?: TransactionOrKnex
  ): Promise<number | undefined> {
    const status = await this.getSpecialStatus(projectId, code, trx)

    return status?.id
  }

  public async getSpecialStatus(
    projectId: number,
    code: SpecialTaskStatusCode,
    trx?: TransactionOrKnex
  ): Promise<TaskStatusModel | undefined> {
    return this.taskStatusRepository.getSpecialStatus(projectId, code, trx)
  }

  public async getOpenStatusId(project: ICreatedRecord, trx?: TransactionOrKnex): Promise<number> {
    const status = await this.getSpecialStatus(project.id, SpecialTaskStatusCode.open, trx)

    if (!status) {
      throw new InternalServerErrorException(
        this.i18n.t('task_status.could_not_find_default_status_open_for_project', {
          lang: I18nContext.current().lang,
          args: { projectId: project.id }
        })
      )
    }

    return status.id
  }

  public async get(statusId: number, projectId: number): Promise<TaskStatusModel> {
    const status = await this.taskStatusRepository.getTaskStatusById(statusId)
    if (!status) {
      throw new NotFoundException(
        this.i18n.t('task_status.status_not_found_for_project', {
          lang: I18nContext.current().lang,
          args: { statusId: statusId, projectId: projectId }
        })
      )
    }

    return status
  }

  public async duplicateTaskStatus(
    duplicationTaskStatusDto: CreateDuplicateTaskStatusDto,
    project: ProjectModel,
    user: UserModel
  ): Promise<{ duplicatedStatus: TaskStatusModel; duplicatedTasks: TaskModel[] }> {
    const originalStatus = await this.get(duplicationTaskStatusDto.statusId, project.id)

    if (!originalStatus) {
      throw new NotFoundException(this.i18n.t('project.status.not_found'))
    }

    if (originalStatus.code === SpecialTaskStatusCode.executed) {
      throw new ForbiddenException(
        this.i18n.t('task.forbidden', {
          lang: I18nContext.current().lang
        })
      )
    }

    const trx = await MyBaseModel.startTransaction()

    try {
      const [name, lastOrder] = await Promise.all([
        this.getAvailableDuplicateName(originalStatus.name, project.id),
        this.statusMover.getLastOrder(project)
      ])

      const dto: CreateStatusDto = { name, order: lastOrder + 1, color: originalStatus.color }

      const duplicatedStatus = await this.create(project, dto, user, trx)

      const duplicatedTasks = await this.taskService.duplicateTasksByStatus(
        originalStatus,
        duplicatedStatus,
        trx
      )

      await Promise.all(
        duplicatedTasks.map(duplicationTask =>
          this.taskService.sendTaskCreatedEvent(duplicationTask, project.id, user)
        )
      )

      const extendedTasksBySubtask = this.extendTasksBySubtask(duplicatedTasks)

      await trx.commit()

      return { duplicatedStatus, duplicatedTasks: extendedTasksBySubtask }
    } catch (e) {
      await trx.rollback()
      console.error(e)
      throw e
    }
  }

  private extendTasksBySubtask(tasks: TaskModel[]): TaskModel[] {
    return tasks.concat(...tasks.map(task => this.extendTasksBySubtask(task.subtasks)))
  }

  private getDefaultStatuses(): TaskDefaultStatusData[] {
    return [
      this.getDefaultOpenStatus(),
      {
        name: 'task.statuses.process',
        code: SpecialTaskStatusCode.process,
        color: '#3271f5',
        order: 2
      },
      {
        name: 'task.statuses.executed',
        code: SpecialTaskStatusCode.executed,
        color: '#30b367',
        order: 3
      }
    ]
  }

  private getDefaultOpenStatus(): TaskDefaultStatusData {
    return {
      name: 'task.statuses.open',
      code: SpecialTaskStatusCode.open,
      color: '#ec9158',
      order: 1
    }
  }

  private getDefaultReviewStatus(): TaskDefaultStatusData {
    return {
      name: 'task.statuses.review',
      code: SpecialTaskStatusCode.review,
      color: '#ffea88ff',
      order: 4
    }
  }

  private async getAvailableDuplicateName(title: string, projectId: number): Promise<string> {
    const match = title.match(REG_EXP_AVAILABLE_DUPLICATE_TITLE)

    let baseTitle = this.i18n.t(match[1].trim(), {
      lang: I18nContext.current().lang
    })

    let currentNumber = match[2] ? parseInt(match[2]) : 0

    let newTitle = title
    let attemptNumber = currentNumber + 1

    while (await this.taskStatusRepository.isTitleExists(newTitle, projectId)) {
      newTitle = `${baseTitle} [${attemptNumber}]`
      attemptNumber++
    }

    return newTitle
  }
}
