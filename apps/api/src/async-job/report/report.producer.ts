import { Injectable } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bull'
import type { Queue } from 'bull'
import Bull from 'bull'
import { Queues, ReportJobs } from '../const'
import { ITaskExecutionReportRequestData } from '../../report/interfaces/report.interface'

@Injectable()
export class ReportProducer {
	constructor(
		@InjectQueue(Queues.REPORT_QUEUE)
		private queue: Queue
	) {}

	public async generateTaskExecutionReportFile(
		data: ITaskExecutionReportRequestData
	): Promise<Bull.Job> {
		return await this.queue.add(ReportJobs.TASK_REPORT_JOB, data, { timeout: 10 * 1000 })
	}
}
