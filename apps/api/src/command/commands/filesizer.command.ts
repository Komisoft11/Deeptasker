import { Command, CommandRunner } from 'nest-commander'
import { FileModel } from '../../file/models/file.model'
import { FileService } from '../../file/services/file.service'

@Command({ name: 'filesizer' })
export class FilesizerCommand extends CommandRunner {
	constructor(private readonly fileService: FileService) {
		super()
	}

	public async run(passedParams: string[], options?: Record<string, any>): Promise<void> {
		const filesWithoutSize = await FileModel.query().where('size', null)

		for (const file of filesWithoutSize) {
			try {
				const metadata = await this.fileService.getFileMetadata(file.filePath)
				await file.$query().patch({ size: metadata.size })
				console.log('Updated size of ' + file.filePath + ' to ' + metadata.size)
			} catch (e) {
				console.log(`[-] Failed updating (${file.filePath}): ` + e.message)
			}
		}
	}
}
