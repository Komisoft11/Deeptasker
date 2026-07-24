import { SpecialTaskStatusCode } from '../../task/models/task-status.model'

export interface TaskDefaultStatusData {
  name: string
  code?: SpecialTaskStatusCode
  color: string
  order: number
}
