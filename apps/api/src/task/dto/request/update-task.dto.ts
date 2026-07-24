import {
  Allow,
  IsDate,
  IsNumber,
  IsOptional,
  Length,
  Max,
  Min,
  MinDate,
  ValidateIf
} from 'class-validator'
import { getCurrentUTCDate, getCurrentUTCDateTime } from '../../../common/helpers/date'
import { Type } from 'class-transformer'
import { TaskRepository } from '../../repositories/task/task.repository'

export class UpdateTaskRequest {
  @IsOptional()
  @ValidateIf(object => object.title !== undefined)
  @Length(1)
  title?: string

  @IsOptional()
  @Allow()
  content?: string

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @MinDate(getCurrentUTCDate(), { message: 'Deadline date should be request the future' })
  deadlineDate?: Date

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @MinDate(getCurrentUTCDateTime(), { message: 'Plan start date should be not request the past' })
  planStartDate?: Date

  @IsOptional()
  @ValidateIf(object => object.estimatedTime !== undefined)
  @IsNumber()
  @Min(1)
  estimatedTime?: number

  @IsOptional()
  @ValidateIf(object => object.priority !== undefined)
  @IsNumber()
  @Min(TaskRepository.Priorities.None)
  @Max(TaskRepository.Priorities.High)
  priority?: number

  @IsOptional()
  @ValidateIf(object => object.statusId !== undefined)
  @IsNumber()
  statusId?: number

  @IsOptional()
  @ValidateIf(object => object.statusId !== undefined)
  @IsNumber()
  statusOrder?: number

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @MinDate(getCurrentUTCDateTime(), { message: 'Date for review should be request the future' })
  dateSentForReview?: Date

  @IsOptional()
  @ValidateIf(object => object.executorId !== undefined)
  @IsNumber()
  executorId?: number

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @MinDate(getCurrentUTCDateTime(), { message: 'Finish date should be request the future' })
  dateFinished?: Date

  @IsOptional()
  @ValidateIf(object => object.finishedByTaskId !== undefined)
  @IsNumber()
  finishedByTaskId?: number

  @IsOptional()
  @ValidateIf(object => object.assignerId !== undefined)
  @IsNumber()
  assignerId?: number

  @IsOptional()
  @ValidateIf(object => object.parentId !== undefined)
  @IsNumber()
  parentId?: number

  @IsOptional()
  @ValidateIf(object => object.projectId !== undefined)
  @IsNumber()
  projectId?: number

  @IsOptional()
  @ValidateIf(object => object.sprintId !== undefined)
  @IsNumber()
  sprintId?: number

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  activeDate?: Date
}
