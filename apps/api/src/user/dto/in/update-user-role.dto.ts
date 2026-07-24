import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class UpdateUserRoleDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  role: string
}
