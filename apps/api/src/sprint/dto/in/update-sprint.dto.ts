import { IsDate, IsOptional, MaxLength } from 'class-validator'
import { Type } from 'class-transformer'

export class UpdateSprintDto {
  @IsOptional()
  @MaxLength(255)
  title?: string

  @IsOptional()
  description?: string

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateStart?: Date

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateEnd?: Date
}
