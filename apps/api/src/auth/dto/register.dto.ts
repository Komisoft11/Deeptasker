import { IUserEmail } from '../../common/interfaces/user-email'
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength
} from 'class-validator'
import { USER_PASSWORD_REGEX } from '../utilities/password'
import { ApiProperty } from '@nestjs/swagger'

export class RegisterDto implements IUserEmail {
  @ApiProperty({
    description: 'User first name',
    example: 'John'
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  firstName: string

  @ApiProperty({
    description: 'User last name',
    example: 'Doe'
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  lastName: string

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com'
  })
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty({
    description: 'User password (minimum 6 characters, must meet security requirements)',
    example: 'SecurePass123!'
  })
  @IsNotEmpty()
  @MinLength(6)
  @IsString()
  @Matches(USER_PASSWORD_REGEX, {
    message: 'Password does not meet security requirements'
  })
  password: string

  @ApiProperty({
    description: 'User agreement to terms and policies',
    example: true
  })
  @IsNotEmpty()
  @IsBoolean()
  hasPoliciesAgreement: boolean
}
