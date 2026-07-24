import { IUser } from '@/entities/User'

export interface ISprintRecord {
  id: number
  status: SprintStatuses
}

export interface ISprintCreateDTO {
  title: string
  description?: string
  dateStart: Date
  dateEnd: Date
  projectId: number
}

export interface ISprintDTO {
  id: number
  title: string
  description?: string
  dateStart: Date
  dateEnd: Date
  user: IUser
  projectId: number
  status: SprintStatuses
  taskIds: number[]
}

export enum SprintStatuses {
  Planned = 'planned',
  Active = 'active',
  Completed = 'completed'
}

export interface ISprintUpdateDTO {
  title?: string
  dateStart?: Date
  dateEnd?: Date
  description?: string
}