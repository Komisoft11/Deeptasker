import { ISprintUpdateEvent } from './sprint-update.event.interface'
import { ISprintDeleteEvent } from './sprint-delete.event.interface'
import { ISprintCreateEvent } from './sprint-create.event.interface'

export interface ISprintEvent {
  id: number
  create?: ISprintCreateEvent
  update?: ISprintUpdateEvent
  delete?: ISprintDeleteEvent
  tasks?: {
    add?: number[]
    remove?: number[]
  }
}