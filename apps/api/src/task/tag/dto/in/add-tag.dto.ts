import {IsNotEmpty} from 'class-validator'

export class AddTagDto {
	@IsNotEmpty()
	tagId: number
}