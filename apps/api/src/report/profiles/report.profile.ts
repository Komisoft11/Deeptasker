import { AutomapperProfile, InjectMapper } from '@automapper/nestjs'
import { Injectable } from '@nestjs/common'
import { createMap, Mapper, MappingProfile } from '@automapper/core'
import { ReportModel } from '../models/report.model'
import { ReportDto } from '../dto/dto/report.dto'

@Injectable()
export class ReportProfile extends AutomapperProfile {
	constructor(@InjectMapper() mapper: Mapper) {
		super(mapper)
	}

	get profile(): MappingProfile {
		return mapper => {
			createMap(mapper, ReportModel, ReportDto)
		}
	}
}
