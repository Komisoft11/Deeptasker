import { IsEmail, IsNotEmpty } from 'class-validator'

export class InviteAdminDto {
  @IsNotEmpty()
  @IsEmail()
  email: string
}
