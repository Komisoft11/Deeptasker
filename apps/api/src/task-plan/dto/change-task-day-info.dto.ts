import { IsDateString, IsInt, IsNotEmpty, Max, Min } from 'class-validator'

export class ChangeTaskDayInfoDto {
	@IsNotEmpty()
	@IsDateString()
	day: Date

	@IsNotEmpty()
	@IsInt()
	@Min(1)
	@Max(6)
	priority: number
}