import { IsArray, IsBoolean, IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator'
import { InviteUserDto } from './add-users-projects.dto'
import { Type } from 'class-transformer'

export class ProjectSettingsDto {
  @IsNotEmpty()
  @IsBoolean()
  isReviewRequired: boolean
}

export class CreateProjectDto {
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(64)
  title: string

  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(32)
  slug: string

  @IsOptional()
  @IsArray()
  invitees?: InviteUserDto[]

  @IsOptional()
  @Type(() => ProjectSettingsDto)
  settings?: ProjectSettingsDto
}
