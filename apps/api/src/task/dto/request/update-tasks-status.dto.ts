import { IsInt, IsNotEmpty } from 'class-validator'

export class UpdateTasksStatusRequest {
  @IsNotEmpty()
  @IsInt()
  projectId: number

  @IsNotEmpty()
  @IsInt()
  sourceStatusId: number

  @IsNotEmpty()
  @IsInt()
  targetStatusId: number
}
