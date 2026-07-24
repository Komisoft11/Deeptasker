import { ArrayNotEmpty, IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator'

export class CreateWorkspaceDto {
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  title: string

  @IsOptional()
  @ArrayNotEmpty()
  emailInvitees?: string[]
}
