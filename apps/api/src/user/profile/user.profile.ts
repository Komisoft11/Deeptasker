import { Injectable } from '@nestjs/common'
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs'
import { createMap, forMember, mapFrom, Mapper, MappingProfile } from '@automapper/core'
import { UserModel } from '../models/user.model'
import { UserSearchDto } from '../dto/out/user-search.dto'
import { UserDto } from '../dto/out/user.dto'
import { UserProfileDto } from '../dto/out/user-profile.dto'
import { transformLocaleDateToDateWithoutTimeZone } from '../../common/helpers/date'

@Injectable()
export class UserProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper)
  }

  get profile(): MappingProfile {
    return mapper => {
      createMap(mapper, UserModel, UserSearchDto)
      createMap(mapper, UserModel, UserDto)
      createMap(
        mapper,
        UserModel,
        UserProfileDto,
        forMember(
          destination => destination.dob,
          mapFrom(source => source.dob && transformLocaleDateToDateWithoutTimeZone(source.dob))
        )
      )
    }
  }
}
