import { BadRequestException, Injectable } from '@nestjs/common'
import { ITaskComponentUpdater } from './component-updater.interface'
import { SprintService } from '../../../../sprint/sprint.service'
import { TaskModel } from '../../../models/task.model'
import { UpdateTaskRequest } from '../../../dto'
import { UserModel } from '../../../../user/models/user.model'
import { TransactionOrKnex } from 'objection'
import dayjs from 'dayjs'
import { getCurrentUTCDateTime } from '../../../../common/helpers/date'

@Injectable()
export class PlanStartDateUpdater implements ITaskComponentUpdater {
  constructor(private readonly sprintService: SprintService) {}

  public async update(
    task: TaskModel,
    updateTaskDto: UpdateTaskRequest,
    user: UserModel,
    trx: TransactionOrKnex
  ): Promise<void> {
    if (updateTaskDto.planStartDate) {
      await this.verifyPlanStartDate(task, updateTaskDto.planStartDate)
    }
  }

  private async verifyPlanStartDate(task: TaskModel, planStart: Date): Promise<void> {
    const planStartDate = dayjs(planStart)

    const isPlanStartDateInPast = planStartDate.isBefore(getCurrentUTCDateTime())

    if (isPlanStartDateInPast) {
      throw new BadRequestException('You can plan starting request future only!')
    }

    if (task.sprintId) {
      const sprint = await this.sprintService.get(task.sprintId)

      const isSprintOuted =
        planStartDate.isBefore(sprint.dateStart) || planStartDate.isAfter(sprint.dateEnd)

      if (isSprintOuted) {
        throw new BadRequestException('You can plan starting request sprint range only!')
      }
    }

    if (task.deadlineDate) {
      if (planStartDate.isAfter(task.deadlineDate)) {
        throw new BadRequestException('You can not plan starting after deadline!')
      }
    }
  }
}
