import { Type } from 'class-transformer'
import { IsDate, IsOptional, MaxDate } from 'class-validator'
import { getCurrentUTCDateTime } from '../../../../common/helpers/date'
import { i18nValidationMessage } from 'nestjs-i18n'

export class TimerHistoryCommentDto {
	@IsOptional()
	comment: string

	@IsOptional()
	@Type(() => Date)
	@IsDate()
	@MaxDate(getCurrentUTCDateTime(), {
		message: i18nValidationMessage('task.timer.end_time_after_current_time')
	})
	endTime?: Date
}
