import { AutoMap } from '@automapper/classes'
import { TaskResponse } from './task.dto'

export class TrackingTaskResponse extends TaskResponse {
  @AutoMap()
  workspaceId: number

  @AutoMap()
  userSecondsTracked: number
}
