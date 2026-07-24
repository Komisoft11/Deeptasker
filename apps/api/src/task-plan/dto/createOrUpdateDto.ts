import { IsDateString, IsNotEmpty } from 'class-validator'

export class CreateOrUpdateDto {
	@IsNotEmpty()
	@IsDateString()
	startDate: Date

	@IsNotEmpty()
	@IsDateString()
	endDate: Date
}
