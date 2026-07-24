import { IsInt, IsNotEmpty } from 'class-validator'

export class CreateDuplicateTaskStatusDto {
  @IsNotEmpty()
  @IsInt()
  statusId: number
}
