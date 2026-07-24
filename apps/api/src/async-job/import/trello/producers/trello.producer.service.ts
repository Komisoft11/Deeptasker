import { Injectable } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bull'
import type { Queue } from 'bull'
import Bull from 'bull'
import { Queues, TrelloJobs } from '../../../const'
import { FileModel } from '../../../../file/models/file.model'
import { UserModel } from '../../../../user/models/user.model'

export interface ITrelloImportData {
	workspaceId: number
	fileId: number
	userId: number
}

@Injectable()
export class TrelloProducerService {
	constructor(
		@InjectQueue(Queues.TRELLO_QUEUE)
		private queue: Queue
	) {}

	public async import(
		workspaceId: number,
		importFile: FileModel,
		user: UserModel
	): Promise<Bull.Job> {
		const data: ITrelloImportData = {
			fileId: importFile.id,
			workspaceId: workspaceId,
			userId: user.id
		}

		return this.queue.add(TrelloJobs.PROJECT_IMPORT_JOB, data, { timeout: 60 * 60 * 1000 })
	}
}
