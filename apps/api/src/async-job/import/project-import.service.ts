import { Injectable } from '@nestjs/common'
import { FileService, IFile } from '../../file/services/file.service'
import { ProjectImportType } from '../const'
import { TrelloProducerService } from './trello/producers/trello.producer.service'
import { UserModel } from '../../user/models/user.model'
import { MyBaseModel } from '../../common/database/base.model'

@Injectable()
export class ProjectImportService {
	constructor(
		private readonly trelloProducerService: TrelloProducerService,
		private readonly fileService: FileService
	) {}

	public static getImportPrefixPath(workspaceId: number, importType: ProjectImportType): string {
		switch (importType) {
			case ProjectImportType.trello:
				return `import/trello/workspace/${workspaceId}`
			default:
				throw new Error(`Invalid project import type: ${importType}`)
		}
	}

	public async import(
		workspaceId: number,
		file: IFile,
		importType: ProjectImportType,
		user: UserModel
	) {
		const trx = await MyBaseModel.startTransaction()
		try {
			const fileModel = await this.fileService.upload(
				file,
				ProjectImportService.getImportPrefixPath(workspaceId, importType),
				user.id,
				trx
			)

			switch (importType) {
				case ProjectImportType.trello:
					await this.trelloProducerService.import(workspaceId, fileModel, user)
					break
				default:
					throw new Error(`Invalid project import type: ${importType}`)
			}

			await trx.commit()
		} catch (e) {
			await trx.rollback()
			throw e
		}
	}
}
