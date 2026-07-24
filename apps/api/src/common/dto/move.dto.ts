import { IsInt, IsNotEmpty, IsOptional } from 'class-validator'

export class MoveDto {
  @IsOptional()
  @IsInt()
  newParentId?: number

  @IsOptional()
  @IsInt()
  parentId?: number

  @IsNotEmpty()
  @IsInt()
  customOrder: number
}