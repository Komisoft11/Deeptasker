import { AutoMap } from '@automapper/classes'
import { UserShortDto } from '../../../common/dto/user-short.dto'

type userWorkspaceRoles = 'admin' | 'member'

export class WorkspaceDto {
	@AutoMap()
	id: number

	@AutoMap()
	uuid: string

	@AutoMap()
	title: string

	@AutoMap()
	projectCount: number

	@AutoMap()
	archivedProjectCount: number

	@AutoMap()
	dateCreated: Date

	@AutoMap(() => UserShortDto)
	user?: UserShortDto

	@AutoMap()
	userRole: userWorkspaceRoles
}
