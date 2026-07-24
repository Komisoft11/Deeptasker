import { TaskModel } from '../models/task.model'
import { TransactionOrKnex } from 'objection'
import { Injectable } from '@nestjs/common'
import { MoveDto } from '../../common/dto/move.dto'
import MoveHelper from '../../common/helpers/move'

@Injectable()
export class TaskMover {
  public async move(task: TaskModel, moveDto: MoveDto, trx?: TransactionOrKnex): Promise<void> {
    if (MoveHelper.isMoveFromOldParentToNew(task, moveDto)) {
      await this.moveFromOldParentToNew(task, moveDto, trx)
    } else if (MoveHelper.isMoveFromOldParentToRoot(task, moveDto)) {
      await this.moveFromOldParentToRoot(task, moveDto, trx)
    } else if (MoveHelper.isMoveFromRootToParent(task, moveDto)) {
      await this.moveFromRootToParent(task, moveDto, trx)
    } else if (MoveHelper.isReorder(task, moveDto)) {
      await this.reorder(task, moveDto.customOrder, trx)
    }
  }

  public async top(task: TaskModel, trx?: TransactionOrKnex): Promise<void> {
    await TaskModel.query(trx).findById(task.id).patch({
      customOrder: 1
    })

    await TaskModel.query(trx)
      .whereNot('id', task.id)
      .andWhere('projectId', task.projectId)
      .andWhere('dateDeleted', null)
      .increment('customOrder', 1)
  }

  public async topInNewProject(
    task: TaskModel,
    previousProjectId: number,
    projectId: number,
    trx?: TransactionOrKnex
  ): Promise<void> {
    await Promise.all([
      TaskModel.query(trx)
        .whereNot('id', task.id)
        .andWhere('projectId', previousProjectId)
        .andWhere('dateDeleted', null)
        .andWhere('customOrder', '>', task.customOrder)
        .decrement('customOrder', 1),
      TaskModel.query(trx)
        .whereNot('id', task.id)
        .andWhere('projectId', projectId)
        .andWhere('dateDeleted', null)
        .increment('customOrder', 1),
      task.$query(trx).patch({
        customOrder: 1,
        parentId: null
      })
    ])
  }

  public async reorder(task: TaskModel, newOrder: number, trx?: TransactionOrKnex): Promise<void> {
    const oldOrder: number = task.customOrder

    await task.$query(trx).patch({ customOrder: newOrder })

    if (oldOrder < newOrder) {
      await TaskModel.query(trx)
        .where('parentId', task.parentId)
        .andWhere('dateDeleted', null)
        .andWhereNot('id', task.id)
        .andWhere('customOrder', '>', oldOrder)
        .andWhere('customOrder', '<=', newOrder)
        .decrement('customOrder', 1)
    } else {
      await TaskModel.query(trx)
        .where('parentId', task.parentId)
        .andWhere('dateDeleted', null)
        .andWhereNot('id', task.id)
        .andWhere('customOrder', '>=', newOrder)
        .andWhere('customOrder', '<', oldOrder)
        .increment('customOrder', 1)
    }
  }

  private async moveFromOldParentToNew(task: TaskModel, moveDto: MoveDto, trx?: TransactionOrKnex) {
    if (!moveDto.customOrder) {
      moveDto.customOrder = 1
    }

    if (task.customOrder) {
      await TaskModel.query(trx)
        .where('parentId', task.parentId)
        .andWhere('dateDeleted', null)
        .andWhere('customOrder', '>', task.customOrder)
        .decrement('customOrder', 1)
    }

    await Promise.all([
      task.$query(trx).patch({
        parentId: moveDto.newParentId,
        customOrder: moveDto.customOrder
      }),
      TaskModel.query(trx)
        .where('parentId', moveDto.newParentId)
        .andWhere('dateDeleted', null)
        .andWhere('id', '!=', task.id)
        .andWhere('customOrder', '>=', moveDto.customOrder)
        .increment('customOrder', 1)
    ])
  }

  private async moveFromOldParentToRoot(
    task: TaskModel,
    moveDto: MoveDto,
    trx?: TransactionOrKnex
  ) {
    if (task.customOrder) {
      await TaskModel.query(trx)
        .where('parentId', task.parentId)
        .andWhere('dateDeleted', null)
        .andWhere('customOrder', '>', task.customOrder)
        .decrement('customOrder', 1)
    }

    await task.$query(trx).patch({
      parentId: null,
      customOrder: moveDto.customOrder
    })

    if (!moveDto.customOrder) {
      moveDto.customOrder = 1
    }

    await TaskModel.query(trx)
      .where('id', '!=', task.id)
      .where('parentId', null)
      .andWhere('dateDeleted', null)
      .andWhere('customOrder', '!=', null)
      .andWhere('customOrder', '>=', moveDto.customOrder)
      .increment('customOrder', 1)
  }

  private async moveFromRootToParent(task: TaskModel, moveDto: MoveDto, trx?: TransactionOrKnex) {
    if (!moveDto.newParentId) {
      throw new Error('moveDto.newParentId is required')
    }

    if (!moveDto.customOrder) {
      moveDto.customOrder = 1
    }

    const oldCustomOrder = task.customOrder

    if (oldCustomOrder) {
      await Promise.all([
        TaskModel.query(trx)
          .where('id', '!=', task.id)
          .andWhere('dateDeleted', null)
          .andWhere('customOrder', '!=', null)
          .andWhere('customOrder', '>', oldCustomOrder)
          .decrement('customOrder', 1)
      ])
    }

    await Promise.all([
      TaskModel.query(trx)
        .where('parentId', moveDto.newParentId)
        .andWhere('dateDeleted', null)
        .andWhere('id', '!=', task.id)
        .andWhere('customOrder', '>=', moveDto.customOrder)
        .increment('customOrder', 1),

      task.$query(trx).patch({
        parentId: moveDto.newParentId,
        customOrder: moveDto.customOrder
      })
    ])
  }
}
