import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import type { ITaskTimerHistoryRepository } from './repositories/timer-history/task-timer-history-repository.interface'
import { TASK_TIMER_HISTORY_REPOSITORY } from './repositories/timer-history/task-timer-history-repository.interface'
import { TransactionOrKnex } from 'objection'
import { TaskModel } from '../models/task.model'
import { TaskTimerHistoryModel } from './models/task-timer-history.model'
import { MyBaseModel } from '../../common/database/base.model'
import { getCurrentUTCDateTime } from '../../common/helpers/date'
import { UserModel } from '../../user/models/user.model'
import type { TaskService as TaskServiceType } from '../services/task.service'
import { TaskService } from '../services/task.service'
import { EventService } from '../../events/event.service'
import { ICreatedRecord } from '../../common/interfaces/created-record.interface'
import { TimerHistoryCommentDto } from './dto/in/timer-history-comment.dto'
import { I18nContext, I18nService } from 'nestjs-i18n'
import { TimerHistoryCreateDto } from './dto/in/timer-history-create.dto'
import { UserService } from '../../user/user.service'
import {
  ITaskTimerRepository,
  TASK_TIMER_REPOSITORY
} from './repositories/timer/task-timer-repository.interface'
import { TaskStatusService } from '../../project/services/task-status/task-status.service'
import { SpecialTaskStatusCode } from '../models/task-status.model'
import { DateDiff } from '../../common/helpers/date-diff'

@Injectable()
export class TimerService {
  constructor(
    @Inject(TASK_TIMER_HISTORY_REPOSITORY)
    private readonly timerHistoryRepository: ITaskTimerHistoryRepository,
    @Inject(TASK_TIMER_REPOSITORY)
    private readonly timerRepository: ITaskTimerRepository,
    @Inject(forwardRef(() => TaskService)) private readonly taskService: TaskServiceType,
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
    private readonly taskStatusService: TaskStatusService,
    private readonly eventService: EventService,
    private i18n: I18nService
  ) {}

  public async start(taskId: number, startedAt: Date, user: UserModel) {
    if (user.activeTaskId) {
      throw new BadRequestException('Already tracking task ' + user.activeTaskId)
    }

    const task = await this.taskService.getTask(taskId)

    if (task.executorId !== user.id) {
      if (!task.executorId && task.assignerId === user.id) {
        // auto assign to myself if I am the assigner
        await this.taskService.assign(task, user.id, startedAt, user)
      } else {
        throw new ForbiddenException('Task ' + task.id + ' is currently not assigned to you')
      }
    }

    const isTimerStarted = await this.timerHistoryRepository.isTimerStarted(task, user)

    if (isTimerStarted) {
      return
    }

    const trx = await TaskTimerHistoryModel.startTransaction()

    try {
      await Promise.all([
        this.timerHistoryRepository.startTimerHistory(task, startedAt, user, trx),
        this.setTaskWithActiveDate(task, startedAt, user, trx),
        this.setUserWithActiveTask(task, user, trx)
      ])

      if (!(await this.isProcessing(task))) {
        const status = await this.taskStatusService.getSpecialStatus(
          task.projectId,
          SpecialTaskStatusCode.process,
          trx
        )
        await this.taskService.update(task, { statusId: status.id }, user, trx)
      }

      await trx.commit()
    } catch (e) {
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
              activeDate: startedAt
            }
          }
        }
      })
      .then()
      .catch(e => {
        console.error(e)
      })
  }

  public async stop(
    taskId: number,
    stoppedAt: Date,
    user: UserModel,
    transaction?: TransactionOrKnex
  ) {
    const task = await this.taskService.getTask(taskId)

    const isStarted = Boolean(task.activeDate)

    if (!isStarted) {
      return
    }

    if (task.executorId !== user.id) {
      throw new ForbiddenException('Task ' + task.id + ' is currently not assigned to you')
    }

    const trx = await MyBaseModel.startTransaction(transaction)

    try {
      await Promise.all([
        this.stopTimerHistory(task, stoppedAt, user, trx),
        this.removeTaskWithActiveDate(task, user, trx),
        this.removeUserWithActiveTask(user, trx)
      ])

      await trx.commit()
    } catch (e) {
      await trx.rollback()
      throw e
    }

    this.sendEvent(task.id, task.projectId, user.id, null)
      .then()
      .catch(e => {
        console.error(e)
      })
  }

  public async getUserHistory(
    task: ICreatedRecord,
    user: UserModel,
    userId?: number
  ): Promise<TaskTimerHistoryModel[]> {
    const where = { taskId: task.id }
    if (userId) {
      where['userId'] = userId
    }
    return TaskTimerHistoryModel.query().withGraphJoined('user(selectShort)').where(where)
  }

  public async getAllHistory(taskId: number, user: UserModel): Promise<TaskTimerHistoryModel[]> {
    return this.getUserHistory({ id: taskId }, user)
  }

  public async getHistory(historyId: number): Promise<TaskTimerHistoryModel> {
    const entry = await this.timerHistoryRepository.getHistory(historyId)

    if (!entry) {
      throw new NotFoundException('Time history not found: ' + historyId)
    }

    return entry
  }

  public async editHistoryEntry(
    history: TaskTimerHistoryModel,
    editDto: TimerHistoryCommentDto,
    user: UserModel
  ) {
    editDto.comment = editDto.comment ? editDto.comment.trim() : editDto.comment

    if (editDto.endTime) {
      if (editDto.endTime < history.startTime) {
        throw new BadRequestException(
          this.i18n.t('task.timer.end_time_before_start_time', { lang: I18nContext.current().lang })
        )
      } else if (editDto.endTime > getCurrentUTCDateTime()) {
        throw new BadRequestException(
          this.i18n.t('task.timer.end_time_after_current_time', {
            lang: I18nContext.current().lang
          })
        )
      }
    }

    if ((history.editedDate || editDto.endTime) && !editDto.comment) {
      throw new BadRequestException(
        this.i18n.t('task.timer.comment_required', { lang: I18nContext.current().lang })
      )
    }

    const trx = await MyBaseModel.startTransaction()
    try {
      const promises = [this.timerHistoryRepository.updateHistory(editDto, history, trx)]

      if (editDto.endTime) {
        let secondsToAdd = this.calculateTrackedSeconds(editDto.endTime, history.endTime)
        if (editDto.endTime > history.endTime) {
          secondsToAdd = Math.abs(secondsToAdd)
        }

        promises.push(this.recordSeconds(history.taskId, secondsToAdd, user.id, trx))
      }

      await Promise.all(promises)

      await trx.commit()
    } catch (e) {
      await trx.rollback()
      throw e
    }

    // TODO: send event
  }

  public async deleteHistoryEntry(history: TaskTimerHistoryModel, user: UserModel) {
    const trx = await MyBaseModel.startTransaction()
    try {
      let secondsToRemove = -this.calculateTrackedSeconds(history.endTime, history.startTime)

      await Promise.all([
        this.recordSeconds(history.taskId, secondsToRemove, user.id, trx),
        this.timerHistoryRepository.deleteHistory(history, trx)
      ])

      await trx.commit()
    } catch (e) {
      await trx.rollback()
      throw e
    }

    // TODO: send event
  }

  public async createTimerHistoryEntry(
    creationTimerHistoryDto: TimerHistoryCreateDto,
    task: TaskModel,
    user: UserModel
  ): Promise<ICreatedRecord> {
    if (creationTimerHistoryDto.startTime && creationTimerHistoryDto.endTime) {
      creationTimerHistoryDto.startTime = new Date(creationTimerHistoryDto.startTime)
      creationTimerHistoryDto.endTime = new Date(creationTimerHistoryDto.endTime)
    }

    creationTimerHistoryDto.comment = creationTimerHistoryDto.comment
      ? creationTimerHistoryDto.comment.trim()
      : creationTimerHistoryDto.comment

    const hasIntersections = await this.timerHistoryRepository.hasIntersections(
      task,
      creationTimerHistoryDto.startTime,
      creationTimerHistoryDto.endTime
    )

    if (hasIntersections) {
      throw new BadRequestException(
        this.i18n.t('task.timer.timer_has_intersections', {
          lang: I18nContext.current().lang
        })
      )
    }

    const trx = await MyBaseModel.startTransaction()

    try {
      const history = await this.timerHistoryRepository.createHistory(
        creationTimerHistoryDto,
        task,
        user,
        trx
      )

      const secondsToAdd = this.calculateTrackedSeconds(history.endTime, history.startTime)

      await this.recordSeconds(history.taskId, secondsToAdd, user.id, trx)

      await trx.commit()

      return { id: history.id }
    } catch (e) {
      await trx.rollback()
      throw e
    }

    // TODO: send event
  }

  private async setTaskWithActiveDate(
    task: TaskModel,
    startTime: Date,
    user: UserModel,
    trx: TransactionOrKnex
  ): Promise<void> {
    return this.taskService.update(task, { activeDate: startTime }, user, trx)
  }

  private async setUserWithActiveTask(
    task: TaskModel,
    user: UserModel,
    trx: TransactionOrKnex
  ): Promise<void> {
    return this.userService.updateUserInfo(user.id, { activeTaskId: task.id }, trx)
  }

  private async stopTimerHistory(
    task: TaskModel,
    stoppedAt: Date,
    user: UserModel,
    trx: TransactionOrKnex
  ) {
    const lastHistory = await this.timerHistoryRepository.getStartedHistory(task, user, trx)
    const secondsTracked = this.calculateTrackedSeconds(lastHistory.startTime, stoppedAt)

    if (secondsTracked > 0) {
      await Promise.all([
        this.timerHistoryRepository.stopTimerHistory(lastHistory, stoppedAt, trx),
        this.recordSeconds(task.id, secondsTracked, user.id, trx)
      ])
    } else {
      await this.timerHistoryRepository.deleteHistory(lastHistory, trx)
    }
  }

  private calculateTrackedSeconds(start: Date, end: Date): number {
    return new DateDiff(start, end).seconds()
  }

  private async removeTaskWithActiveDate(
    task: TaskModel,
    user: UserModel,
    trx: TransactionOrKnex
  ): Promise<void> {
    await this.taskService.update(task, { activeDate: null }, user, trx)
  }

  private async removeUserWithActiveTask(user: UserModel, trx: TransactionOrKnex): Promise<void> {
    await this.userService.updateUserInfo(user.id, { activeTaskId: null }, trx)
  }

  private async sendEvent(taskId: number, projectId: number, userId: number, activeDate: Date) {
    return this.eventService.sendEvent({
      userId: userId,
      project: {
        id: projectId,
        task: {
          id: taskId,
          update: {
            activeDate: activeDate
          }
        }
      }
    })
  }

  private async recordSeconds(
    taskId: number,
    secondsTracked: number,
    userId: number,
    trx: TransactionOrKnex
  ): Promise<void> {
    const taskTimer = await this.timerRepository.getTaskTimer(taskId, userId, trx)

    const secondsToAdd = Math.floor(secondsTracked)

    if (!taskTimer?.id) {
      await this.timerRepository.createTaskTimer(taskId, userId, secondsToAdd, trx)
      return
    }

    if (secondsToAdd !== 0) {
      const newSeconds = taskTimer.seconds + secondsToAdd
      if (newSeconds <= 0) {
        await this.timerRepository.deleteTaskTimer(taskTimer, trx)
      } else {
        await this.timerRepository.updateTaskTimer(taskTimer, newSeconds, trx)
      }
    }
  }

  private async isProcessing(task: TaskModel): Promise<boolean> {
    const status = await this.taskStatusService.get(task.statusId, task.projectId)
    return status.code === SpecialTaskStatusCode.process
  }
}
