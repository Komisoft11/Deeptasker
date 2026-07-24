import { IsDate, IsOptional, MaxLength, MinDate, MinLength } from 'class-validator'
import { Type } from 'class-transformer'
import { getCurrentUTCDateTime } from '../../../../common/helpers/date'

export class UpdateProjectDto {
  @IsOptional()
  @MinLength(3)
  @MaxLength(64)
  title?: string

  @IsOptional()
  @MinLength(3)
  @MaxLength(32)
  slug?: string

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @MinDate(getCurrentUTCDateTime(), { message: 'Finish date should be in the future' })
  dateArchived?: Date
}
