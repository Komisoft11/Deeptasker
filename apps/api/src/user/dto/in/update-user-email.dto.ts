import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator'

export class UpdateUserEmailDto {
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  email: string
}
