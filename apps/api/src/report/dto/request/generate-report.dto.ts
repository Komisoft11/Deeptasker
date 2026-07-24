import { type FileReportFormat, type IReportFields } from '../../interfaces/report.interface'
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
import { ApiProperty } from '@nestjs/swagger'

class Fields implements IReportFields {
  @ApiProperty({
    description: 'Include task description in the report',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  description?: boolean

  @ApiProperty({
    description: 'Include task creation date in the report',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  dateCreated?: boolean

  @ApiProperty({
    description: 'Include task execution date in the report',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  dateExecuted?: boolean

  @ApiProperty({
    description: 'Include sprint information in the report',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  sprint?: boolean

  @ApiProperty({
    description: 'Include time expired status in the report',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  timeExpired?: boolean

  @ApiProperty({
    description: 'Include task executor information in the report',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  executor?: boolean

  @ApiProperty({
    description: 'Include task assigner information in the report',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  assigner?: boolean

  @ApiProperty({
    description: 'Include task observers list in the report',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  observers?: boolean

  @ApiProperty({
    description: 'Include attached file links in the report',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  fileLinks?: boolean

  @ApiProperty({
    description: 'Include task tags in the report',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  tags?: boolean

  @ApiProperty({
    description: 'Include task deadline date in the report',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  dateDeadline?: boolean

  @ApiProperty({
    description: 'Include estimated time for task completion',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  timeEstimate?: boolean

  @ApiProperty({
    description: 'Include actual time spent on the task',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  spentTime?: boolean

  @ApiProperty({
    description: 'Include task status information in the report',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  status?: boolean

  @ApiProperty({
    description: 'Include task ID in the report',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  taskId?: boolean

  @ApiProperty({
    description: 'Include task name/title in the report',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  name?: boolean

  @ApiProperty({
    description: 'Include task creator information in the report',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  creator?: boolean
}

export class GenerateReportRequest {
  @ApiProperty({
    description: 'Start date of the reporting period (inclusive)',
    example: '2026-01-01T00:00:00.000Z'
  })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  periodStart: Date

  @ApiProperty({
    description: 'End date of the reporting period (inclusive)',
    example: '2026-01-31T23:59:59.000Z'
  })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  periodEnd: Date

  @ApiProperty({
    description: 'Output format of the generated report',
    example: 'PDF'
  })
  @IsNotEmpty()
  format: FileReportFormat

  @ApiProperty({
    description: 'Report title that will appear in the document header',
    example: 'Task Execution Report - January 2026'
  })
  @IsNotEmpty()
  @IsString()
  title: string

  @ApiProperty({
    description: 'Array of task status IDs to include in the report',
    example: [1, 2, 3, 4, 5]
  })
  @ArrayNotEmpty()
  @IsArray()
  statuses: number[]

  @ApiProperty({
    description:
      'Optional configuration for which fields to include in the report. If not provided, default fields will be used.',
    example: {
      description: true,
      dateCreated: true,
      executor: true,
      status: true,
      name: true,
      taskId: true,
      dateDeadline: true
    }
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Fields)
  fields?: Fields
}
