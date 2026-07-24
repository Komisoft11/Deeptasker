import { IsDate, IsNotEmpty, IsOptional, MaxLength } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateSprintDto {
  @IsNotEmpty()
  @MaxLength(255)
  title: string

  @IsOptional()
  description?: string

  @IsNotEmpty()
  projectId: number

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  dateStart: Date

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  dateEnd: Date
}
