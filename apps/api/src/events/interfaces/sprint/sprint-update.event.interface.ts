import { SprintStatuses } from '../../../sprint/model/sprint.model'

export interface ISprintUpdateEvent {
  dateEnd?: Date
  dateStart?: Date
  title?: string
  description?: string
}