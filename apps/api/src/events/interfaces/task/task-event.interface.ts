import { TaskResponse } from '../../../task/dto'
import { ITaskUpdateEvent } from './task-update.event.interface'
import { IEntityDeleteEvent } from '../entity-delete.event'
import { ITaskMoveEvent } from './task-move.interface'

export interface ITaskEvent {
  id: number
  create?: TaskResponse
  update?: ITaskUpdateEvent
  delete?: IEntityDeleteEvent
  move?: ITaskMoveEvent
}
