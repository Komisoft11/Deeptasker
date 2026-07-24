import { IsEmail, IsNotEmpty } from 'class-validator'

export class UserLoginDto {
	@IsNotEmpty()
	@IsEmail()
	readonly email: string

	@IsNotEmpty()
	readonly password: string
}
