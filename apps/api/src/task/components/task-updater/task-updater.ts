import { Inject, Injectable } from '@nestjs/common'
import { TaskModel } from '../../models/task.model'
import { UpdateTaskRequest } from '../../dto'
import { TransactionOrKnex } from 'objection'
import {
  type ITaskRepository,
  TASK_REPOSITORY
} from '../../repositories/task/task-repository.interface'
import { StatusUpdater } from './updaters/status-updater'
import { ITaskComponentUpdater } from './updaters/component-updater.interface'
import { UserModel } from '../../../user/models/user.model'
import { SprintUpdater } from './updaters/sprint-updater'
import { ITaskUpdater } from './task-updater.interface'
import { DeadlineUpdater } from './updaters/deadline-updater'
import { PlanStartDateUpdater } from './updaters/plan-start-date-updater'

@Injectable()
export class TaskUpdater implements ITaskUpdater {
  private updaters: ITaskComponentUpdater[] = []
  constructor(
    @Inject(TASK_REPOSITORY) private readonly taskRepository: ITaskRepository,
    private readonly statusUpdater: StatusUpdater,
    private readonly sprintUpdater: SprintUpdater,
    private readonly deadlineUpdater: DeadlineUpdater,
    private readonly planStartDateUpdater: PlanStartDateUpdater
  ) {
    this.setUpdater(this.statusUpdater)
    this.setUpdater(this.sprintUpdater)
    this.setUpdater(this.deadlineUpdater)
    this.setUpdater(this.planStartDateUpdater)
  }

  private setUpdater(updater: ITaskComponentUpdater) {
    this.updaters.push(updater)
  }

  public async update(
    task: TaskModel,
    updateTaskDto: UpdateTaskRequest,
    user: UserModel,
    trx: TransactionOrKnex
  ) {
    await Promise.all(this.updaters.map(updater => updater.update(task, updateTaskDto, user, trx)))

    await this.updateTaskFields(task, updateTaskDto, trx)
  }

  public async updateTaskFields(
    task: TaskModel,
    updateTaskDto: UpdateTaskRequest,
    trx: TransactionOrKnex
  ): Promise<void> {
    return this.taskRepository.updateTaskFields(task, updateTaskDto, trx)
  }
}
