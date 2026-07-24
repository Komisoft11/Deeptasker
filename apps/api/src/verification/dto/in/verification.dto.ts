import { IsEmail, IsNotEmpty, Length } from 'class-validator'

export class VerificationDto {
	@IsNotEmpty()
	@Length(6)
	readonly code: string

	@IsNotEmpty()
	@IsEmail()
	readonly email: string
}

export class ResendCodeDto {
	@IsNotEmpty()
	@IsEmail()
	readonly email: string
}
