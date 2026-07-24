import { IsEmail, IsNotEmpty, Length, MinLength } from 'class-validator'

export class PasswordResetRequestDto {
	@IsNotEmpty()
	@IsEmail()
	readonly email: string
}

export class PasswordResetVerifyDto {
	@IsNotEmpty()
	@IsEmail()
	readonly email: string

	@IsNotEmpty()
	@Length(6)
	readonly code: string
}

export class PasswordResetSetDto {
	@IsNotEmpty()
	@IsEmail()
	readonly email: string

	@IsNotEmpty()
	@Length(6)
	readonly code: string

	@IsNotEmpty()
	@MinLength(6)
	password: string
}
