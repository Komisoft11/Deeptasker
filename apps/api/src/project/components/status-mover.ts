import { Injectable } from '@nestjs/common'
import { ProjectModel } from '../models/project.model'
import { TransactionOrKnex } from 'objection'
import { TaskStatusModel } from '../../task/models/task-status.model'
import { TaskModel } from '../../task/models/task.model'
import { ITaskStatusChange } from '../../task/services/task.service'

@Injectable()
export class StatusMover {
	public async getLastOrder(project: ProjectModel): Promise<number> {
		const status = await TaskStatusModel.query()
			.select('order')
			.where('projectId', project.id)
			.orderBy('order', 'DESC')
			.limit(1)
			.first()

		return status.order
	}

	public async reorderStatusesAfterDelete(
		projectId: number,
		order: number,
		trx: TransactionOrKnex
	): Promise<void> {
		await TaskStatusModel.query(trx)
			.where('projectId', projectId)
			.where('order', '>', order)
			.decrement('order', 1)
	}

	public async moveStatuses(
		status: TaskStatusModel,
		newOrder: number,
		trx: TransactionOrKnex
	): Promise<void> {
		const oldOrder: number = status.order

		if (oldOrder < newOrder) {
			await TaskStatusModel.query(trx)
				.where('projectId', status.projectId)
				.andWhere('id', '!=', status.id)
				.andWhere('order', '>', oldOrder)
				.andWhere('order', '<=', newOrder)
				.decrement('order', 1)
		} else {
			await TaskStatusModel.query(trx)
				.where('projectId', status.projectId)
				.andWhere('id', '!=', status.id)
				.andWhere('order', '>=', newOrder)
				.andWhere('order', '<', oldOrder)
				.increment('order', 1)
		}
	}

	public async updateTaskStatusInOldAndNew(
		task: TaskModel,
		changeStatusDto: ITaskStatusChange,
		trx: TransactionOrKnex
	): Promise<void> {
		// TODO::Send Event to Users
		await Promise.all([
			TaskModel.query(trx)
				.where('statusId', changeStatusDto.oldStatusId)
				.andWhere('id', '!=', task.id)
				.andWhere('statusOrder', '>', task.statusOrder)
				.decrement('statusOrder', 1),
			TaskModel.query(trx)
				.where('statusId', changeStatusDto.newStatusId)
				.andWhere('id', '!=', task.id)
				.andWhere('statusOrder', '>=', changeStatusDto.newOrder)
				.increment('statusOrder', 1),
			task.$query(trx).patch({
				statusOrder: changeStatusDto.newOrder
			})
		])
	}

	public async reorderTasksInStatus(
		task: TaskModel,
		statusChange: ITaskStatusChange,
		trx: TransactionOrKnex
	) {
		await task.$query(trx).patch({ statusOrder: statusChange.newOrder })

		// TODO::SendEvent Users
		if (statusChange.oldOrder < statusChange.newOrder) {
			await TaskModel.query(trx)
				.where('id', '!=', task.id)
				.andWhere('statusId', task.statusId)
				.andWhere('statusOrder', '>', statusChange.oldOrder)
				.andWhere('statusOrder', '<=', statusChange.newOrder)
				.decrement('statusOrder', 1)
		} else {
			await TaskModel.query(trx)
				.where('id', '!=', task.id)
				.andWhere('statusId', task.statusId)
				.andWhere('statusOrder', '>=', statusChange.newOrder)
				.andWhere('statusOrder', '<', statusChange.oldOrder)
				.increment('statusOrder', 1)
		}
	}

	public async topTaskStatus(task: TaskModel, trx: TransactionOrKnex): Promise<void> {
		await Promise.all([
			task.$query(trx).patch({
				statusOrder: 1
			}),
			TaskModel.query(trx)
				.where('statusId', task.statusId)
				.andWhere('projectId', task.projectId)
				.andWhere('id', '!=', task.id)
				.increment('statusOrder', 1)
		])
	}
}
