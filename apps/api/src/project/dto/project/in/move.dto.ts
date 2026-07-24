import { IsInt, IsNotEmpty, Min } from 'class-validator'

export class MoveDto {
	@IsNotEmpty()
	@IsInt()
	@Min(1)
	order: number
}
