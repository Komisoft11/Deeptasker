import { IsDate, IsString, MaxDate, MaxLength, MinLength } from 'class-validator'
import { Type } from 'class-transformer'
import { getCurrentUTCDateTime } from '../../../../common/helpers/date'
import { i18nValidationMessage } from 'nestjs-i18n'

export class TimerHistoryCreateDto {
	@IsString()
	@MinLength(3)
	@MaxLength(255)
	comment: string

	@Type(() => Date)
	@IsDate()
	@MaxDate(getCurrentUTCDateTime(), {
		message: i18nValidationMessage('task.timer.start_time_after_current_time')
	})
	startTime: Date

	@Type(() => Date)
	@IsDate()
	@MaxDate(getCurrentUTCDateTime(), {
		message: i18nValidationMessage('task.timer.end_time_after_current_time')
	})
	endTime: Date
}
