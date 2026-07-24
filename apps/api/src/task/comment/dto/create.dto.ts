import { IsNotEmpty, IsOptional } from 'class-validator'

export class CreateDto {
	@IsNotEmpty()
	comment: string

	@IsOptional()
	replyId: number
}
