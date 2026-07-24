import { TaskResponse } from '../../../../task/dto'

export class DuplicatedTaskStatusDto {
  id: number

  name: string

  tasksDTOs: TaskResponse[]
}
