import { InjectModel } from '@squareboat/nestjs-objection'
import { Injectable } from '@nestjs/common'
import { Repository } from '../../../../common/database/repository'
import { ITaskTimerRepository } from './task-timer-repository.interface'
import { TaskTimerModel } from '../../models/task-timer.model'
import { TransactionOrKnex } from 'objection'

@Injectable()
export class TaskTimerRepository
  extends Repository<TaskTimerModel>
  implements ITaskTimerRepository
{
  @InjectModel(TaskTimerModel)
  model: TaskTimerModel

  public async getTaskTimer(
    taskId: number,
    userId: number,
    trx?: TransactionOrKnex
  ): Promise<TaskTimerModel> {
    return TaskTimerModel.query(trx)
      .findOne({
        taskId: taskId,
        userId: userId
      })
      .limit(1)
  }

  public async createTaskTimer(
    taskId: number,
    userId: number,
    seconds: number,
    trx?: TransactionOrKnex
  ): Promise<TaskTimerModel> {
    return TaskTimerModel.query(trx).insert({
      taskId: taskId,
      userId: userId,
      seconds: seconds
    })
  }

  public async deleteTaskTimer(taskTimer: TaskTimerModel, trx?: TransactionOrKnex): Promise<void> {
    await taskTimer.$query(trx).delete()
  }

  public async updateTaskTimer(
    taskTimer: TaskTimerModel,
    seconds: number,
    trx?: TransactionOrKnex
  ): Promise<void> {
    await taskTimer.$query(trx).patch({
      seconds: seconds
    })
  }
}
