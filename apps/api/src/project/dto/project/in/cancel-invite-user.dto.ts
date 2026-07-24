import { IsEmail, IsNotEmpty } from 'class-validator'

export class CancelInviteUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string
}
