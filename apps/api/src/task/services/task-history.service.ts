import { Injectable } from '@nestjs/common'
import { TaskHistoryModel } from '../models/task-history.model'
import { TransactionOrKnex } from 'objection'
import { getCurrentUTCDateTime } from '../../common/helpers/date'
import { TaskHistoryResponse } from '../dto'
import { InjectMapper } from '@automapper/nestjs'
import type { Mapper } from '@automapper/core'

interface ITaskChange {
  field: TaskHistoryField
  oldValue: string
  newValue: string
}

export enum TaskHistoryField {
  status = 'status',
  executor = 'executor',
  assigner = 'assigner',
  project = 'project'
}

@Injectable()
export class TaskHistoryService {
  constructor(@InjectMapper() private readonly mapper: Mapper) {}

  public async recordHistory(
    taskId: number,
    change: ITaskChange,
    userId: number,
    trx?: TransactionOrKnex
  ): Promise<void> {
    await TaskHistoryModel.query(trx).insert({
      taskId: taskId,
      userId: userId,
      dateCreated: getCurrentUTCDateTime(),
      oldValue: change.oldValue,
      newValue: change.newValue,
      field: change.field
    })
  }

  public async getHistory(taskId: number): Promise<TaskHistoryResponse[]> {
    const changes = await TaskHistoryModel.query()
      .where('taskId', taskId)
      .orderBy('date_created', 'DESC')

    return this.mapper.mapArray(changes, TaskHistoryModel, TaskHistoryResponse)
  }
}
