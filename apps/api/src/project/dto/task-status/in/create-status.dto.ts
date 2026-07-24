import { IsHexColor, IsInt, IsNotEmpty, Min, MinLength, ValidateIf } from 'class-validator'

export class CreateStatusDto {
	@IsNotEmpty()
	@MinLength(3)
	name: string

	@ValidateIf(o => o.order !== undefined)
	@IsInt()
	@Min(1)
	order?: number

	@ValidateIf(o => o.color !== undefined)
	@IsHexColor()
	color?: string
}