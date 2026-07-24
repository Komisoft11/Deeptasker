import { TaskModel } from '../../../models/task.model'
import { UpdateTaskRequest } from '../../../dto'
import { TransactionOrKnex } from 'objection'
import { UserModel } from '../../../../user/models/user.model'

export interface ITaskComponentUpdater {
  update(
    task: TaskModel,
    updateTaskDto: UpdateTaskRequest,
    user: UserModel,
    trx: TransactionOrKnex
  ): Promise<void>
}
