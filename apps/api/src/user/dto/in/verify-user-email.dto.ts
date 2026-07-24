import { IsNotEmpty, Length } from 'class-validator'

export class VerifyUserEmailDto {
  @IsNotEmpty()
  @Length(6)
  readonly code: string
}
