import { InjectModel } from '@squareboat/nestjs-objection'
import { Injectable } from '@nestjs/common'
import { Repository } from '../../../common/database/repository'
import { ITaskStatusRepository } from './task-status-repository.interface'
import { SpecialTaskStatusCode, TaskStatusModel } from '../../../task/models/task-status.model'
import { TransactionOrKnex } from 'objection'
import { UpdateStatusDto } from '../../dto/task-status/in/update-status.dto'
import { TaskDefaultStatusData } from '../../interfaces/task-status.interface'
import { ProjectModel } from '../../models/project.model'
import { getCurrentUTCDateTime } from '../../../common/helpers/date'

@Injectable()
export class TaskStatusRepository
  extends Repository<TaskStatusModel>
  implements ITaskStatusRepository
{
  @InjectModel(TaskStatusModel)
  model: TaskStatusModel

  public async createTaskStatus(
    createStatusData: TaskDefaultStatusData,
    projectId: number,
    trx?: TransactionOrKnex
  ): Promise<TaskStatusModel> {
    return TaskStatusModel.query(trx)
      .insert({
        name: createStatusData.name,
        color: createStatusData.color,
        order: createStatusData.order,
        code: createStatusData.code ?? null,
        projectId: projectId
      })
      .onConflict(['projectId', 'name'])
      .ignore()
  }

  public async getTaskStatusById(id: number): Promise<TaskStatusModel> {
    return TaskStatusModel.query().where('id', id).andWhere('dateDeleted', null).first()
  }

  public async updateTaskStatus(
    taskStatus: TaskStatusModel,
    updateStatusDto: UpdateStatusDto,
    trx?: TransactionOrKnex
  ): Promise<void> {
    const updates = []

    if (updateStatusDto.name && taskStatus.name !== updateStatusDto.name) {
      updates.push(taskStatus.$query(trx).patch({ name: updateStatusDto.name }))
    }

    if (updateStatusDto.color && taskStatus.color !== updateStatusDto.color) {
      updates.push(taskStatus.$query(trx).patch({ color: updateStatusDto.color }))
    }

    if (updateStatusDto.order && taskStatus.order !== updateStatusDto.order) {
      updates.push(
        taskStatus.$query(trx).patch({
          order: updateStatusDto.order
        })
      )
    }

    await Promise.all(updates)
  }

  public async deleteStatus(id: number, trx?: TransactionOrKnex): Promise<void> {
    await TaskStatusModel.query(trx).findById(id).patch({
      dateDeleted: getCurrentUTCDateTime()
    })
  }

  public async getStatuesByProject(project: ProjectModel): Promise<TaskStatusModel[]> {
    return TaskStatusModel.query()
      .select(['name', 'code', 'order', 'color', 'id'])
      .where('projectId', project.id)
      .andWhere('dateDeleted', null)
      .orderBy('order', 'asc')
  }

  public async projectHasStatusId(projectId: number, statusId: number): Promise<boolean> {
    return TaskStatusModel.query()
      .where('id', statusId)
      .andWhere('dateDeleted', null)
      .andWhere('projectId', projectId)
      .exists()
  }

  public async getSpecialStatus(
    projectId: number,
    code: SpecialTaskStatusCode,
    trx?: TransactionOrKnex
  ): Promise<TaskStatusModel | undefined> {
    return TaskStatusModel.query(trx)
      .where('projectId', projectId)
      .andWhere('code', code)
      .andWhere('dateDeleted', null)
      .limit(1)
      .first()
  }

  public async isTitleExists(name: string, projectId: number): Promise<boolean> {
    return TaskStatusModel.query().where('name', name).andWhere('projectId', projectId).exists()
  }
}
