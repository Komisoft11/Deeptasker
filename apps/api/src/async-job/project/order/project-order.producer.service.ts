import { Injectable } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bull'
import { ProjectJobs, Queues } from '../../const'
import Bull from 'bull'
import type { Queue } from 'bull'

export interface IProjectOrderData {
	projectId: number
	order: number
	parentId?: number
	newParentId?: number
	userId: number
}

@Injectable()
export class ProjectOrderProducerService {
	constructor(
		@InjectQueue(Queues.PROJECT_ORDER_QUEUE)
		private queue: Queue
	) {}

	public async changeOrder(orderData: IProjectOrderData): Promise<Bull.Job> {
		return await this.queue.add(ProjectJobs.PROJECT_ORDER_JOB, orderData, { timeout: 10 * 1000 })
	}
}
