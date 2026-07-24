import { Inject, Injectable } from '@nestjs/common'
import { ITaskComponentUpdater } from './component-updater.interface'
import {
  type ITaskRepository,
  TASK_REPOSITORY
} from '../../../repositories/task/task-repository.interface'
import { TaskModel } from '../../../models/task.model'
import { UpdateTaskRequest } from '../../../dto'
import { UserModel } from '../../../../user/models/user.model'
import { TransactionOrKnex } from 'objection'
import { SprintService } from '../../../../sprint/sprint.service'

@Injectable()
export class SprintUpdater implements ITaskComponentUpdater {
  constructor(
    private readonly sprintService: SprintService,
    @Inject(TASK_REPOSITORY) private readonly taskRepository: ITaskRepository
  ) {}

  public async update(
    task: TaskModel,
    updateTaskDto: UpdateTaskRequest,
    user: UserModel,
    trx: TransactionOrKnex
  ): Promise<void> {
    const isSprintUnchanged =
      updateTaskDto.sprintId === undefined || updateTaskDto.sprintId === task.id

    if (isSprintUnchanged) {
      return
    }

    const shouldRemoveFromSprint = updateTaskDto.sprintId === null

    if (shouldRemoveFromSprint) {
      const sprint = await this.sprintService.get(task.sprintId)
      const subtasks = await this.getSameSprintedSubtasks(task, sprint.id)
      const ids = subtasks.map(subtask => subtask.id).concat(task.id)

      return this.sprintService.removeTasks(sprint, { taskIds: ids }, user, trx)
    }

    const sprint = await this.sprintService.get(updateTaskDto.sprintId)
    const subtasks = await this.getNotSameSprintedSubtasks(task, sprint.id)
    const ids = subtasks.map(subtask => subtask.id).concat(task.id)

    return this.sprintService.addTasks(sprint, { taskIds: ids }, user, trx)
  }

  private async getNotSameSprintedSubtasks(
    parent: TaskModel,
    sprintId: number
  ): Promise<TaskModel[]> {
    const result: TaskModel[] = []

    const subtasks = await this.taskRepository.getSubtasks(parent)

    for (const subtask of subtasks) {
      const children = await this.getNotSameSprintedSubtasks(subtask, sprintId)
      result.push(...children)

      if (subtask.sprintId === null || subtask.sprintId !== sprintId) {
        result.push(subtask)
      }
    }

    return result
  }

  private async getSameSprintedSubtasks(parent: TaskModel, sprintId: number): Promise<TaskModel[]> {
    const result: TaskModel[] = []

    const subtasks = await this.taskRepository.getSubtasks(parent)

    for (const subtask of subtasks) {
      const children = await this.getSameSprintedSubtasks(subtask, sprintId)
      result.push(...children)

      if (subtask.sprintId === sprintId) {
        result.push(subtask)
      }
    }

    return result
  }
}
