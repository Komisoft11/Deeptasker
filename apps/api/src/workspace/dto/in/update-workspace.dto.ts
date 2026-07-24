import { IsNotEmpty, MaxLength, MinLength } from 'class-validator'

export class UpdateWorkspaceDto {
	@IsNotEmpty()
	@MinLength(3)
	@MaxLength(255)
	title: string
}