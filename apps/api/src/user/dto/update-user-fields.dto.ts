import { PHONE_NUMBER_REGEX } from './in/update-user.dto'
import { IsDate, IsEmail, IsEnum, IsOptional, IsString, Matches, MaxLength } from 'class-validator'
import { UserSex } from '../models/user.model'
import { Type } from 'class-transformer'

export class UpdateUserFieldsDto {
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
  username?: string

  @IsOptional()
  @IsString()
  @Matches(PHONE_NUMBER_REGEX, {
    message: 'Invalid phone number'
  })
  phoneNumber?: string

  @IsOptional()
  @IsString()
  @MaxLength(30)
  role?: string

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string
}
