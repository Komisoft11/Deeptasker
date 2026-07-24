import { Injectable } from '@nestjs/common'
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs'
import type { Mapper } from '@automapper/core'
import { createMap, forMember, mapFrom, MappingProfile, nullSubstitution } from '@automapper/core'
import { ProjectDto } from '../dto/project/out/project.dto'
import { ProjectModel } from '../models/project.model'
import { UserModel } from '../../user/models/user.model'
import { TaskStatusModel } from '../../task/models/task-status.model'
import { TaskStatusDto } from '../../common/dto/task-status.dto'
import { UserProjectDto } from '../dto/project/out/user-project.dto'
import { TaskModel } from '../../task/models/task.model'
import { TaskResponse } from '../../task/dto'
import { MemberInvitationDto } from '../dto/project/out/member-invitee.dto'
import { ProjectInvitationsModel } from '../models/project-invitations.model'
import { ProjectRoleEnum } from '../components/permissions/types/roles/project-role.interface'

@Injectable()
export class ProjectProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper)
  }

  get profile(): MappingProfile {
    return mapper => {
      createMap(
        mapper,
        UserModel,
        UserProjectDto,
        forMember(
          d => d.isAdmin,
          mapFrom(s => s.projectRole === ProjectRoleEnum.admin)
        )
      )
      createMap(mapper, TaskStatusModel, TaskStatusDto)
      createMap(
        mapper,
        ProjectModel,
        ProjectDto,
        forMember(d => d.order, nullSubstitution(undefined))
      )
      createMap(
        mapper,
        TaskModel,
        TaskResponse,
        forMember(
          destination => destination.subtasks,
          mapFrom(source => source.subtasks?.map(t => t.id) ?? [])
        )
      )
      createMap(mapper, ProjectInvitationsModel, MemberInvitationDto)
    }
  }
}
