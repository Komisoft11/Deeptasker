import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator'

export const USERNAME_REGEX = /^[a-zA-Z0-9._]*$/

export class CheckUsernameDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @MinLength(3)
  @Matches(USERNAME_REGEX, {
    message: `Use only Latin letters, numbers, periods and "_"`
  })
  username: string
}
