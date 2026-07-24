import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator'
import { USER_PASSWORD_REGEX } from '../utilities/password'

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  password: string

  @IsNotEmpty()
  @MinLength(8)
  @IsString()
  @Matches(USER_PASSWORD_REGEX, {
    message: 'Can not be a password'
  })
  newPassword: string
}
