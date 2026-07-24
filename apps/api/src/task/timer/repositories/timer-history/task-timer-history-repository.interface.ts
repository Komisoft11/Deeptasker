import { CustomQueryBuilder, RepositoryContract } from '@squareboat/nestjs-objection'
import { TaskTimerHistoryModel } from '../../models/task-timer-history.model'
import { TimerHistoryCreateDto } from '../../dto/in/timer-history-create.dto'
import { UserModel } from '../../../../user/models/user.model'
import { TaskModel } from '../../../models/task.model'
import { TransactionOrKnex } from 'objection'
import { TimerHistoryCommentDto } from '../../dto/in/timer-history-comment.dto'

export const TASK_TIMER_HISTORY_REPOSITORY = 'task_timer_history_repository'

export interface ITaskTimerHistoryRepository extends RepositoryContract<TaskTimerHistoryModel> {
  query<R = TaskTimerHistoryModel>(): CustomQueryBuilder<TaskTimerHistoryModel, R>

  startTimerHistory(
    task: TaskModel,
    startDateTime: Date,
    user: UserModel,
    trx?: TransactionOrKnex
  ): Promise<TaskTimerHistoryModel>

  stopTimerHistory(
    history: TaskTimerHistoryModel,
    stopDateTime: Date,
    trx?: TransactionOrKnex
  ): Promise<void>

  createHistory(
    creationTaskTimerHistoryDto: TimerHistoryCreateDto,
    task: TaskModel,
    user: UserModel,
    trx?: TransactionOrKnex
  ): Promise<TaskTimerHistoryModel>

  getHistory(historyId: number): Promise<TaskTimerHistoryModel>

  updateHistory(
    editDto: TimerHistoryCommentDto,
    history: TaskTimerHistoryModel,
    trx?: TransactionOrKnex
  ): Promise<void>

  deleteHistory(history: TaskTimerHistoryModel, trx?: TransactionOrKnex): Promise<void>

  hasIntersections(task: TaskModel, startTime: Date, endTime: Date): Promise<boolean>

  isTimerStarted(task: TaskModel, user: UserModel): Promise<boolean>

  getStartedHistory(
    task: TaskModel,
    user: UserModel,
    trx?: TransactionOrKnex
  ): Promise<TaskTimerHistoryModel>
}
