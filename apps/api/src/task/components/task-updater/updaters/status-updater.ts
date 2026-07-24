import { TaskModel } from '../../../models/task.model'
import { UpdateTaskRequest } from '../../../dto'
import { TransactionOrKnex } from 'objection'
import { ITaskComponentUpdater } from './component-updater.interface'
import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { ITaskStatusChange, TaskService } from '../../../services/task.service'
import { TaskStatusService } from '../../../../project/services/task-status/task-status.service'
import { UserModel } from '../../../../user/models/user.model'
import { SpecialTaskStatusCode, TaskStatusModel } from '../../../models/task-status.model'
import {
  type ITaskRepository,
  TASK_REPOSITORY
} from '../../../repositories/task/task-repository.interface'
import { StatusMover } from '../../../../project/components/status-mover'
import { getCurrentUTCDateTime } from '../../../../common/helpers/date'

@Injectable()
export class StatusUpdater implements ITaskComponentUpdater {
  constructor(
    @Inject(forwardRef(() => TaskStatusService))
    private readonly taskStatusService: TaskStatusService,
    @Inject(TASK_REPOSITORY) private readonly taskRepository: ITaskRepository,
    @Inject(forwardRef(() => TaskService))
    private readonly taskService: TaskService,
    private readonly statusMover: StatusMover
  ) {}

  public async update(
    task: TaskModel,
    updateTaskDto: UpdateTaskRequest,
    user: UserModel,
    trx: TransactionOrKnex
  ): Promise<void> {
    if (!updateTaskDto.statusId) {
      return
    }

    if (!updateTaskDto.statusId && !updateTaskDto.statusOrder) {
      return
    }

    const status = await this.taskStatusService.get(updateTaskDto.statusId, task.projectId)

    const changeStatusDTO: ITaskStatusChange = {
      oldOrder: task.statusOrder,
      newOrder: updateTaskDto.statusOrder,
      newStatusId: updateTaskDto.statusId,
      oldStatusId: task.statusId
    }

    await this.processStatusChange(task, user, status, trx)
    await this.updateStatusOrder(task, changeStatusDTO, trx)
  }

  public async processStatusChange(
    task: TaskModel,
    user: UserModel,
    status: TaskStatusModel,
    trx?: TransactionOrKnex
  ) {
    console.log('Processing default status change', status.name)
    const promises: unknown[] = []

    const { dateFinished, id: taskId } = task
    const { id, code } = status
    const updatedAt = getCurrentUTCDateTime()

    const statusHandlers = {
      [SpecialTaskStatusCode.open]: () => {
        !!dateFinished && promises.push(this.taskService.backToWork(taskId, user, trx))
        promises.push(this.taskRepository.simpleUpdateStatus(task, id, trx))
      },

      [SpecialTaskStatusCode.process]: () => {
        !!dateFinished && promises.push(this.taskService.backToWork(taskId, user, trx))
        promises.push(this.taskRepository.simpleUpdateStatus(task, id, trx))
      },

      [SpecialTaskStatusCode.executed]: () => {
        promises.push(this.taskService.finish(task, user, updatedAt, trx))
      },

      default: () => {
        !!dateFinished && promises.push(this.taskService.backToWork(taskId, user, trx))
        promises.push(this.taskRepository.simpleUpdateStatus(task, id, trx))
      }
    }

    const handleStatus = statusHandlers[code] || statusHandlers['default']
    handleStatus()
    await Promise.all(promises)
  }

  public async updateStatusOrder(
    task: TaskModel,
    statusChangeDTO: ITaskStatusChange,
    trx: TransactionOrKnex
  ) {
    if (statusChangeDTO.newOrder === undefined) {
      await this.statusMover.topTaskStatus(task, trx)
    } else {
      if (statusChangeDTO.oldStatusId === statusChangeDTO.newStatusId) {
        await this.statusMover.reorderTasksInStatus(task, statusChangeDTO, trx)
      } else {
        await this.statusMover.updateTaskStatusInOldAndNew(task, statusChangeDTO, trx)
      }
    }
  }
}
