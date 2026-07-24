import { AutoMap } from '@automapper/classes'
import { UserShortDto } from '../../../../common/dto/user-short.dto'

export class TimerHistoryDto {
	@AutoMap()
	user?: UserShortDto

	@AutoMap()
	startTime: Date

	@AutoMap()
	endTime: Date

	@AutoMap()
	editedDate: Date
}