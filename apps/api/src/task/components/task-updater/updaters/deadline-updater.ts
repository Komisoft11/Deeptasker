import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common'
import { ITaskComponentUpdater } from './component-updater.interface'
import { TaskModel } from '../../../models/task.model'
import { UpdateTaskRequest } from '../../../dto'
import { UserModel } from '../../../../user/models/user.model'
import { TransactionOrKnex } from 'objection'
import { SprintService } from '../../../../sprint/sprint.service'
import { TaskService } from '../../../services/task.service'
import dayjs from 'dayjs'
import { getCurrentUTCDateTime } from '../../../../common/helpers/date'

@Injectable()
export class DeadlineUpdater implements ITaskComponentUpdater {
  constructor(
    private readonly sprintService: SprintService,
    @Inject(forwardRef(() => TaskService))
    private readonly taskService: TaskService
  ) {}

  public async update(
    task: TaskModel,
    updateTaskDto: UpdateTaskRequest,
    user: UserModel,
    trx: TransactionOrKnex
  ): Promise<void> {
    if (updateTaskDto.deadlineDate) {
      await this.verifyDeadline(task, updateTaskDto.deadlineDate)
    }
  }

  private async verifyDeadline(task: TaskModel, deadline: Date): Promise<void> {
    const deadlineDate = dayjs(deadline)

    const isDeadlineInPast = deadlineDate.isBefore(getCurrentUTCDateTime())

    if (isDeadlineInPast) {
      throw new BadRequestException('Deadline must be request the future!')
    }

    if (task.sprintId) {
      const sprint = await this.sprintService.get(task.sprintId)

      const isSprintOuted =
        deadlineDate.isBefore(sprint.dateStart) || deadlineDate.isAfter(sprint.dateEnd)

      if (isSprintOuted) {
        throw new BadRequestException('Deadline must be request sprint range!')
      }
    }

    if (task.parentId) {
      const parent = await this.taskService.getTask(task.parentId)

      if (parent.deadlineDate && parent.deadlineDate < deadline) {
        throw new BadRequestException(
          'Subtask deadline can not be greater then parent task deadline!'
        )
      }
    }
  }
}
