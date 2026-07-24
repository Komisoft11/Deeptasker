import { CustomQueryBuilder, RepositoryContract } from '@squareboat/nestjs-objection'
import { TaskTimerModel } from '../../models/task-timer.model'
import { TransactionOrKnex } from 'objection'

export const TASK_TIMER_REPOSITORY = 'task_timer_repository'

export interface ITaskTimerRepository extends RepositoryContract<TaskTimerModel> {
  query<R = TaskTimerModel>(): CustomQueryBuilder<TaskTimerModel, R>

  getTaskTimer(taskId: number, userId: number, trx?: TransactionOrKnex): Promise<TaskTimerModel>

  createTaskTimer(
    taskId: number,
    userId: number,
    seconds: number,
    trx?: TransactionOrKnex
  ): Promise<TaskTimerModel>

  deleteTaskTimer(taskTimer: TaskTimerModel, trx?: TransactionOrKnex): Promise<void>

  updateTaskTimer(
    taskTimer: TaskTimerModel,
    seconds: number,
    trx?: TransactionOrKnex
  ): Promise<void>
}
