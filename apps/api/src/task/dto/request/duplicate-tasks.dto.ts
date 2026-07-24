import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber } from 'class-validator'
import { Type } from 'class-transformer'

export class DuplicationTasksRequest {
  @IsNotEmpty()
  @IsNumber()
  targetStatusId: number

  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  tasksIds: number[]

  @IsNotEmpty()
  @IsNumber()
  projectId: number
}
