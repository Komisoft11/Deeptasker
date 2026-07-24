import { IEntityDeleteEvent } from '../entity-delete.event'

export interface ITaskDeleteEvent extends IEntityDeleteEvent {
  dateDeleted: Date
}
