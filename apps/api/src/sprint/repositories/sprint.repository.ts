import { Injectable } from '@nestjs/common'
import { Repository } from '../../common/database/repository'
import { InjectModel } from '@squareboat/nestjs-objection'
import { SprintModel, SprintStatuses } from '../model/sprint.model'
import { ISprintRepository } from './sprint-repository.interface'
import { UserModel } from '../../user/models/user.model'
import { CreateSprintDto } from '../dto/in/create-sprint.dto'
import { DataBaseException } from '../../exceptions/DataBaseException'
import { TransactionOrKnex } from 'objection'
import { UpdateSprintDto } from '../dto/in/update-sprint.dto'
import { getCurrentUTCDateTime, transformToUTCDateTime } from '../../common/helpers/date'
import { TasksSprintDto } from '../dto/in/tasks-sprint.dto'
import { TaskModel } from '../../task/models/task.model'

@Injectable()
export class SprintRepository extends Repository<SprintModel> implements ISprintRepository {
  @InjectModel(SprintModel)
  model: SprintModel

  public async createSprint(
    createSprintDto: CreateSprintDto,
    user: UserModel,
    trx?: TransactionOrKnex
  ): Promise<SprintModel> {
    try {
      return SprintModel.query(trx).insert({
        title: createSprintDto.title,
        projectId: createSprintDto.projectId,
        description: createSprintDto.description,
        userId: user.id,
        dateStart: createSprintDto.dateStart,
        dateEnd: createSprintDto.dateEnd,
        status: this.getStatus(
          transformToUTCDateTime(createSprintDto.dateStart),
          transformToUTCDateTime(createSprintDto.dateEnd)
        )
      })
    } catch (e) {
      throw new DataBaseException(e)
    }
  }

  public async getSprint(id: number): Promise<SprintModel> {
    return SprintModel.query()
      .findById(id)
      .andWhere('dateDeleted', null)
      .withGraphFetched('[user(selectShort), tasks(selectId, notDeleted)]')
  }

  public async updateSprint(
    sprint: SprintModel,
    updateSprintDto: UpdateSprintDto,
    trx?: TransactionOrKnex
  ): Promise<void> {
    const updates = [
      sprint.$query(trx).patch({
        title: updateSprintDto.title,
        description: updateSprintDto.description,
        dateStart: updateSprintDto.dateStart,
        dateEnd: updateSprintDto.dateEnd
      })
    ]

    if (updateSprintDto?.dateStart || updateSprintDto?.dateEnd) {
      updates.push(
        sprint.$query(trx).patch({
          status: this.getStatus(
            transformToUTCDateTime(updateSprintDto?.dateStart) ?? sprint.dateStart,
            transformToUTCDateTime(updateSprintDto?.dateEnd) ?? sprint.dateEnd
          )
        })
      )
    }

    await Promise.all(updates)
  }

  public async deleteSprint(sprint: SprintModel, trx?: TransactionOrKnex): Promise<any> {
    await sprint.$query(trx).patch({
      dateDeleted: getCurrentUTCDateTime()
    })
  }

  public async getSprintsByProject(projectId: number): Promise<SprintModel[]> {
    return SprintModel.query()
      .where('dateDeleted', null)
      .andWhere('projectId', projectId)
      .withGraphFetched('[user(selectShort), tasks(selectId, notDeleted)]')
  }

  public async addTasks(
    sprint: SprintModel,
    tasksSprintDto: TasksSprintDto,
    trx?: TransactionOrKnex
  ): Promise<any> {
    await TaskModel.query(trx)
      .whereIn('id', tasksSprintDto.taskIds)
      .andWhere('dateDeleted', null)
      .patch({
        sprintId: sprint.id
      })
  }

  public async removeTasks(tasksSprintDto: TasksSprintDto, trx?: TransactionOrKnex): Promise<any> {
    await TaskModel.query(trx)
      .whereIn('id', tasksSprintDto.taskIds)
      .andWhere('dateDeleted', null)
      .patch({
        sprintId: null
      })
  }

  public async isSprintExistsInProject(title: string, projectId: number): Promise<boolean> {
    return SprintModel.query()
      .where('title', title)
      .andWhere('dateDeleted', null)
      .andWhere('projectId', projectId)
      .exists()
  }

  private getStatus(start: Date, end: Date): SprintStatuses {
    if (start > getCurrentUTCDateTime()) {
      return SprintStatuses.Planned
    }

    if (end < getCurrentUTCDateTime()) {
      return SprintStatuses.Completed
    }

    return SprintStatuses.Active
  }
}
