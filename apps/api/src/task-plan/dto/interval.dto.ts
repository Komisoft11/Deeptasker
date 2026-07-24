import { IsDateString, IsNotEmpty } from 'class-validator'

export class IntervalDto {
	@IsNotEmpty({ message: 'Не заполнена начальная дата!' })
	@IsDateString()
	dateFrom: Date

	@IsNotEmpty({ message: 'Не заполнена конечная дата!' })
	@IsDateString()
	dateTo: Date
}
