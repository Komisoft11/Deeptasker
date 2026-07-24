import { IEntityDeleteEvent } from '../entity-delete.event'

export interface ISprintDeleteEvent extends IEntityDeleteEvent {
  projectId: number
}
