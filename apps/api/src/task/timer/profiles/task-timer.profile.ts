import { Injectable } from '@nestjs/common'
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs'
import { createMap, MappingProfile } from '@automapper/core'
import type { Mapper } from '@automapper/core'
import { TaskTimerHistoryModel } from '../models/task-timer-history.model'
import { TimerHistoryDto } from '../dto/out/timer-history.dto'
import { UserModel } from '../../../user/models/user.model'
import { UserShortDto } from '../../../common/dto/user-short.dto'

@Injectable()
export class TaskTimerProfile extends AutomapperProfile {
	constructor(@InjectMapper() mapper: Mapper) {
		super(mapper)
	}

	get profile(): MappingProfile {
		return mapper => {
			createMap(mapper, UserModel, UserShortDto)
			createMap(mapper, TaskTimerHistoryModel, TimerHistoryDto)
		}
	}
}
