import { ArrayNotEmpty, IsArray } from 'class-validator'

export class TasksSprintDto {
  @ArrayNotEmpty()
  @IsArray()
  taskIds: number[]
}
