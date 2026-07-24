import { InjectModel } from '@squareboat/nestjs-objection'
import { Injectable } from '@nestjs/common'
import { Repository } from '../../../../common/database/repository'
import { TaskTimerHistoryModel } from '../../models/task-timer-history.model'
import { ITaskTimerHistoryRepository } from './task-timer-history-repository.interface'
import { TimerHistoryCreateDto } from '../../dto/in/timer-history-create.dto'
import { TaskModel } from '../../../models/task.model'
import { UserModel } from '../../../../user/models/user.model'
import { getCurrentUTCDateTime } from '../../../../common/helpers/date'
import { TransactionOrKnex } from 'objection'
import { TimerHistoryCommentDto } from '../../dto/in/timer-history-comment.dto'

@Injectable()
export class TaskTimerHistoryRepository
  extends Repository<TaskTimerHistoryModel>
  implements ITaskTimerHistoryRepository
{
  @InjectModel(TaskTimerHistoryModel)
  model: TaskTimerHistoryModel

  public async getHistory(historyId: number): Promise<TaskTimerHistoryModel> {
    return TaskTimerHistoryModel.query().where('id', historyId).first()
  }

  public async startTimerHistory(
    task: TaskModel,
    startDateTime: Date,
    user: UserModel,
    trx?: TransactionOrKnex
  ): Promise<TaskTimerHistoryModel> {
    return TaskTimerHistoryModel.query(trx).insert({
      taskId: task.id,
      startTime: startDateTime,
      userId: user.id
    })
  }

  public async stopTimerHistory(
    history: TaskTimerHistoryModel,
    stopDateTime: Date,
    trx?: TransactionOrKnex
  ): Promise<void> {
    await history.$query(trx).patch({
      endTime: stopDateTime
    })
  }

  public async createHistory(
    creationTaskTimerHistoryDto: TimerHistoryCreateDto,
    task: TaskModel,
    user: UserModel,
    trx?: TransactionOrKnex
  ): Promise<TaskTimerHistoryModel> {
    return TaskTimerHistoryModel.query(trx).insert({
      taskId: task.id,
      userId: user.id,
      startTime: creationTaskTimerHistoryDto.startTime,
      endTime: creationTaskTimerHistoryDto.endTime,
      comment: creationTaskTimerHistoryDto.comment,
      editedDate: getCurrentUTCDateTime()
    })
  }

  public async updateHistory(
    editDto: TimerHistoryCommentDto,
    history: TaskTimerHistoryModel,
    trx?: TransactionOrKnex
  ): Promise<void> {
    await history.$query(trx).patch({
      comment: editDto.comment,
      endTime: editDto.endTime ?? undefined,
      editedDate: editDto.endTime ? getCurrentUTCDateTime() : undefined
    })
  }

  public async deleteHistory(
    history: TaskTimerHistoryModel,
    trx?: TransactionOrKnex
  ): Promise<void> {
    await history.$query(trx).delete()
  }

  public async hasIntersections(task: TaskModel, startTime: Date, endTime: Date): Promise<boolean> {
    return TaskTimerHistoryModel.query()
      .where('taskId', task.id)
      .andWhere(builder => {
        builder.where('startTime', '<', endTime).andWhere('endTime', '>', startTime)
      })
      .exists()
  }

  public async isTimerStarted(task: TaskModel, user: UserModel): Promise<boolean> {
    return TaskTimerHistoryModel.query()
      .where('taskId', task.id)
      .andWhere('userId', user.id)
      .andWhere('endTime', null)
      .exists()
  }

  public async getStartedHistory(
    task: TaskModel,
    user: UserModel,
    trx?: TransactionOrKnex
  ): Promise<TaskTimerHistoryModel> {
    return TaskTimerHistoryModel.query(trx)
      .where('taskId', task.id)
      .andWhere('userId', user.id)
      .andWhere('endTime', null)
      .orderBy('startTime', 'DESC')
      .first()
  }
}
