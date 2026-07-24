import { AutoMap } from '@automapper/classes'
import { ProjectModel } from '../../../project/models/project.model'
import { TaskModel } from '../../../task/models/task.model'
import { UserShortDto } from '../../../common/dto/user-short.dto'

export class FolderDto {
	@AutoMap()
	id: number

	@AutoMap()
	title: string

	@AutoMap()
	userId: number

	@AutoMap()
	projectId: number

	@AutoMap()
	parentId?: number

	@AutoMap()
	dateUpdated?: Date

	@AutoMap()
	dateCreated: Date

	@AutoMap()
	customOrder: number

	@AutoMap()
	taskIds?: number[]

	@AutoMap()
	subFolderIds: number[]

	@AutoMap()
	taskCount: number

	@AutoMap(() => UserShortDto)
	user: UserShortDto
}
