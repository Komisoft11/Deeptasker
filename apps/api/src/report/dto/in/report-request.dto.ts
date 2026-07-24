import {
	ArrayNotEmpty,
	IsArray,
	IsBoolean,
	IsDate,
	IsNotEmpty,
	IsObject,
	IsOptional,
	IsString,
	ValidateNested
} from 'class-validator'
import { Type } from 'class-transformer'
import { FileReportFormat, IReportFields } from '../../interfaces/report.interface'

class Fields implements IReportFields {
	@IsOptional()
	@IsBoolean()
	description?: boolean

	@IsOptional()
	@IsBoolean()
	dateCreated?: boolean

	@IsOptional()
	@IsBoolean()
	dateExecuted?: boolean

	@IsOptional()
	@IsBoolean()
	sprint?: boolean

	@IsOptional()
	@IsBoolean()
	timeExpired?: boolean

	@IsOptional()
	@IsBoolean()
	executor?: boolean

	@IsOptional()
	@IsBoolean()
	assigner?: boolean

	@IsOptional()
	@IsBoolean()
	observers?: boolean

	@IsOptional()
	@IsBoolean()
	fileLinks?: boolean

	@IsOptional()
	@IsBoolean()
	tags?: boolean

	@IsOptional()
	@IsBoolean()
	dateDeadline?: boolean

	@IsOptional()
	@IsBoolean()
	timeEstimate?: boolean

	@IsOptional()
	@IsBoolean()
	spentTime?: boolean

	@IsOptional()
	@IsBoolean()
	status?: boolean

	@IsOptional()
	@IsBoolean()
	taskId?: boolean

	@IsOptional()
	@IsBoolean()
	name?: boolean

	@IsOptional()
	@IsBoolean()
	creator?: boolean
}

class ReportRequestDto {
	@IsNotEmpty()
	@Type(() => Date)
	@IsDate()
	periodStart: Date

	@IsNotEmpty()
	@Type(() => Date)
	@IsDate()
	periodEnd: Date

	@IsNotEmpty()
	format: FileReportFormat

	@IsNotEmpty()
	@IsString()
	title: string

	@ArrayNotEmpty()
	@IsArray()
	statuses: number[]
}

export class TaskExecutionReportRequestDto extends ReportRequestDto {
	@IsOptional()
	@IsObject()
	@ValidateNested()
	@Type(() => Fields)
	fields: Fields
}
