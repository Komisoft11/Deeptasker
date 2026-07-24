import { UserShortDto } from '../../../../common/dto/user-short.dto'
import { AutoMap } from '@automapper/classes'

export class UserProjectDto extends UserShortDto
{
	@AutoMap()
	isAdmin?: boolean
}