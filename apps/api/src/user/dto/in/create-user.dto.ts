import { RegisterDto } from '../../../auth/dto/register.dto'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class CreateUserDto extends RegisterDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  username: string
}
