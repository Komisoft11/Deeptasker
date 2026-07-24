import { Injectable } from '@nestjs/common'
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs'
import { createMap, forMember, mapFrom, MappingProfile } from '@automapper/core'
import type { Mapper } from '@automapper/core'
import { FolderModel } from '../model/folder.model'
import { FolderDto } from '../dto/out/folder.dto'
import { UserModel } from '../../user/models/user.model'
import { UserShortDto } from '../../common/dto/user-short.dto'

@Injectable()
export class FolderProfile extends AutomapperProfile {
	constructor(@InjectMapper() mapper: Mapper) {
		super(mapper)
	}

	get profile(): MappingProfile {
		return mapper => {
			createMap(mapper, UserModel, UserShortDto)
			createMap(
				mapper,
				FolderModel,
				FolderDto,
				forMember(
					destination => destination.taskIds,
					mapFrom(source => (source.tasks?.length ? source.tasks.map(t => t.id) : []))
				),
				forMember(
					destination => destination.subFolderIds,
					mapFrom(source => (source.subFolders?.length ? source.subFolders.map(f => f.id) : []))
				)
			)
		}
	}
}
