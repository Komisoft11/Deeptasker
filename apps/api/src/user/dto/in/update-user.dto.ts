import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength
} from 'class-validator'
import { UserSex } from '../../models/user.model'
import { Type } from 'class-transformer'
import { USERNAME_REGEX } from './check-username.dto'

export const PHONE_NUMBER_REGEX = /^[0-9]+$/

export class UpdateUserDto {
  @IsOptional()
  @MaxLength(255)
  firstName?: string

  @IsOptional()
  @MaxLength(255)
  lastName?: string

  @IsOptional()
  @MaxLength(255)
  middleName?: string

  @IsOptional()
  @MaxLength(255)
  description?: string

  @IsOptional()
  @IsEnum(UserSex)
  sex?: string

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dob?: Date

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @MinLength(3)
  @Matches(USERNAME_REGEX, {
    message: `Use only Latin letters, numbers, periods and "_"`
  })
  username?: string

  @IsOptional()
  @Matches(PHONE_NUMBER_REGEX, {
    message: 'Invalid phone number',
    always: false
  })
  phoneNumber?: string | null

  @IsOptional()
  @IsNumber()
  activeTaskId?: number
}
