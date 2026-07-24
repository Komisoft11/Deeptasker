import { IsOptional, IsString } from 'class-validator'

export class DeleteUserDto {
  @IsOptional()
  @IsString()
  password: string

  @IsOptional()
  @IsString()
  code: string
}
