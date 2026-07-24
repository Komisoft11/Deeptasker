import { IsNotEmpty, IsString, MinLength } from 'class-validator'

export class TaskCommentReactDto {
	@IsNotEmpty()
	@IsString()
	@MinLength(1)
	name: string
}
