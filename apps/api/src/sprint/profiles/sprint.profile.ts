import { Injectable } from '@nestjs/common'
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs'
import type { Mapper } from '@automapper/core'
import { createMap, forMember, mapFrom, MappingProfile } from '@automapper/core'
import { TaskStatusModel } from '../../task/models/task-status.model'
import { TaskStatusDto } from '../../common/dto/task-status.dto'
import { SprintModel } from '../model/sprint.model'
import { SprintDto } from '../dto/out/sprint.dto'
import { UserModel } from '../../user/models/user.model'
import { UserShortDto } from '../../common/dto/user-short.dto'
import { ShortSprintDto } from '../dto/out/short-sprint.dto'

@Injectable()
export class SprintProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper)
  }

  get profile(): MappingProfile {
    return mapper => {
      createMap(mapper, UserModel, UserShortDto)
      createMap(mapper, TaskStatusModel, TaskStatusDto)
      createMap(
        mapper,
        SprintModel,
        SprintDto,
        forMember(
          destination => destination.taskIds,
          mapFrom(source => (source.tasks?.length ? source.tasks.map(t => t.id) : []))
        )
      )
      createMap(mapper, SprintModel, ShortSprintDto)
    }
  }
}
