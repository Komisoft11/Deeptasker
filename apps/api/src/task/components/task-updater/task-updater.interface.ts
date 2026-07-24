import { TaskModel } from '../../models/task.model'
import { UpdateTaskRequest } from '../../dto'
import { TransactionOrKnex } from 'objection'
import { ITaskComponentUpdater } from './updaters/component-updater.interface'

export interface ITaskUpdater extends ITaskComponentUpdater {
  updateTaskFields(
    task: TaskModel,
    updateTaskDto: UpdateTaskRequest,
    trx: TransactionOrKnex
  ): Promise<void>
}
