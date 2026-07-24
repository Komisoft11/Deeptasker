import { Injectable } from '@nestjs/common'
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs'
import {
  createMap,
  forMember,
  mapFrom,
  Mapper,
  MappingProfile,
  mapWith,
  mapWithArguments
} from '@automapper/core'
import {
  ExtendedTaskResponse,
  TagResponse,
  TaskCommentReactionResponse,
  TaskCommentResponse,
  TaskHistoryResponse,
  TaskRoleResponse,
  TaskShortResponse,
  TaskUserResponse,
  TrackingTaskResponse,
  UploadedFileResponse
} from '../dto'
import { UserModel } from '../../user/models/user.model'
import { TaskModel } from '../models/task.model'
import { FileModel } from '../../file/models/file.model'
import { TaskCommentModel } from '../comment/models/task-comment.model'
import { TaskUserModel } from '../access/models/task-user.model'
import { TaskRoleModel } from '../access/models/task-role.model'
import { TaskStatusModel } from '../models/task-status.model'
import { TaskStatusDto } from '../../common/dto/task-status.dto'
import { TagModel } from '../tag/models/tag.model'
import { UserShortDto } from '../../common/dto/user-short.dto'
import { generateFgColorForBg } from '../../common/helpers/color'
import { TaskHistoryModel } from '../models/task-history.model'
import { TaskCommentReactionModel } from '../comment/models/task-comment-reaction.model'
import { getCurrentUTCDateTime } from '../../common/helpers/date'
import { DateDiff } from '../../common/helpers/date-diff'

@Injectable()
export class TaskProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper)
  }

  get profile(): MappingProfile {
    return mapper => {
      createMap(mapper, UserModel, UserShortDto)
      createMap(
        mapper,
        TaskModel,
        TaskShortResponse,
        forMember(
          destination => destination.userSecondsTracked,
          mapFrom(source => source?.currentExecutorTimer?.seconds ?? 0)
        )
      )
      createMap(mapper, TaskStatusModel, TaskStatusDto)
      createMap(
        mapper,
        TagModel,
        TagResponse,
        forMember(
          destination => destination.colorBg,
          mapFrom(source => source.color)
        ),
        forMember(
          destination => destination.colorFg,
          mapFrom(source => generateFgColorForBg(source.color))
        )
      )
      createMap(mapper, FileModel, UploadedFileResponse)
      createMap(mapper, TaskCommentReactionModel, TaskCommentReactionResponse)
      createMap(
        mapper,
        TaskCommentModel,
        TaskCommentResponse,
        forMember(
          destination => destination.content,
          mapFrom(source => source.comment)
        )
      )
      createMap(mapper, TaskRoleModel, TaskRoleResponse)
      createMap(mapper, TaskHistoryModel, TaskHistoryResponse)
      createMap(
        mapper,
        TaskUserModel,
        TaskUserResponse,
        forMember(
          destination => destination.role,
          mapWith(TaskRoleResponse, TaskRoleModel, source => source.taskRole)
        )
      )
      createMap(
        mapper,
        TaskModel,
        ExtendedTaskResponse,
        forMember(
          destination => destination.userSecondsTracked,
          mapWithArguments((source, { currentUser }: Record<string, UserModel>) => {
            const timer = source.timers.find(timer => timer.userId === currentUser.id)
            return timer?.seconds ?? 0
          })
        ),
        forMember(
          destination => destination.totalSecondsTracked,
          mapFrom(source =>
            source?.timers?.length > 0
              ? source.timers.reduce((seconds, timer) => seconds + timer.seconds, 0)
              : 0
          )
        )
      )
      createMap(
        mapper,
        TaskModel,
        TrackingTaskResponse,
        forMember(
          destination => destination.subtasks,
          mapFrom(source => (source.subtasks ? source.subtasks.map(t => t.id) : []))
        ),
        forMember(
          destination => destination.userSecondsTracked,
          mapWithArguments((source, { currentUser }: Record<string, UserModel>) => {
            const timer = source.timers.find(timer => timer.userId === currentUser.id)
            let seconds = timer?.seconds ?? 0

            if (source.activeDate !== null) {
              const diff = new DateDiff(getCurrentUTCDateTime(), source.activeDate).seconds()
              seconds += diff
            }

            return seconds
          })
        ),
        forMember(
          destination => destination.workspaceId,
          mapFrom(source => source.project.workspaceId)
        )
      )
    }
  }
}
