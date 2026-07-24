import { TaskUserResponse } from './task-user.dto'
import { AutoMap } from '@automapper/classes'
import { UploadedFileResponse } from './uploaded-file.dto'

export class ExtendedTaskResponse {
  @AutoMap()
  id: number

  @AutoMap()
  userSecondsTracked: number

  @AutoMap()
  totalSecondsTracked: number

  @AutoMap(() => [TaskUserResponse])
  invited?: TaskUserResponse[]

  @AutoMap(() => [UploadedFileResponse])
  files?: UploadedFileResponse[]
}
