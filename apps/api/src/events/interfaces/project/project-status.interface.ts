interface IProjectStatusCreateEvent {
  name: string
  color: string
  order: number
}

interface IProjectStatusUpdateEvent {
  name?: string
  color?: string
}

interface IProjectStatusDeleteEvent {
  dateDeleted: Date
}

export interface IProjectStatusEvent {
  statusId: number
  create?: IProjectStatusCreateEvent
  update?: IProjectStatusUpdateEvent
  delete?: IProjectStatusDeleteEvent
}
