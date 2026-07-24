import { Injectable } from '@nestjs/common'
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs'
import { createMap, forMember, mapFrom, Mapper, MappingProfile } from '@automapper/core'
import { UserModel } from '../../user/models/user.model'
import { UserShortDto } from '../../common/dto/user-short.dto'
import { WorkspaceModel } from '../models/workspace.model'
import { WorkspaceDto } from '../dto/out/workspace.dto'
import { WorkspaceInvitationsModel } from '../models/workspace-invitations.model'
import { AdminInviteeDto } from '../dto/out/admin-invitee.dto'

@Injectable()
export class WorkspaceProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper)
  }

  get profile(): MappingProfile {
    return mapper => {
      createMap(mapper, UserModel, UserShortDto)
      createMap(mapper, WorkspaceInvitationsModel, AdminInviteeDto)
      createMap(
        mapper,
        WorkspaceModel,
        WorkspaceDto,
        forMember(
          dest => dest.userRole,
          mapFrom(() => {
            return 'member'
          })
        )
      )
    }
  }
}
