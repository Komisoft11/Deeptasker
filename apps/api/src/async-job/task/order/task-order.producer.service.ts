import { Injectable } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bull'
import { Queues, TaskJobs } from '../../const'
import Bull from 'bull'
import type { Queue } from 'bull'
import { TransactionOrKnex } from 'objection'

export interface ITaskOrderData {
	taskId: number
	customOrder?: number
	parentId?: number
	newParentId?: number
	userId: number
	type: 'reorder' | 'move'
	trx?: TransactionOrKnex
}

@Injectable()
export class TaskOrderProducerService {
	constructor(
		@InjectQueue(Queues.TASK_ORDER_QUEUE)
		private queue: Queue
	) {}

	public async changeOrder(orderData: ITaskOrderData): Promise<Bull.Job> {
		return await this.queue.add(TaskJobs.TASK_ORDER_JOB, orderData, { timeout: 10 * 1000 })
	}
}
