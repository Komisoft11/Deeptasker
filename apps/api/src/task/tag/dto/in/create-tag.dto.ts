import { IsHexColor, IsNotEmpty, IsString } from 'class-validator'

export class CreateTagDto {
	@IsNotEmpty()
	@IsString()
	name: string

	@IsNotEmpty()
	@IsHexColor()
	color: string
}
