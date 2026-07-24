import { ITaskRequired } from '../../../common/interfaces/task-required-fields'
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinDate,
  ValidateIf
} from 'class-validator'
import { getCurrentUTCDateTime } from '../../../common/helpers/date'
import { Type } from 'class-transformer'
import { TaskRepository } from '../../repositories/task/task.repository'

export class CreateTaskRequest implements ITaskRequired {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string

  @IsNotEmpty()
  @IsNumber()
  projectId: number

  @IsOptional()
  content?: string

  @IsOptional()
  @ValidateIf(object => object.statusId !== undefined)
  @IsNumber()
  statusId?: number

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @MinDate(getCurrentUTCDateTime(), { message: 'Deadline date should be in the future' })
  deadlineDate?: Date

  @ValidateIf(object => object.priority !== undefined)
  @IsNumber()
  @Min(TaskRepository.Priorities.None)
  @Max(TaskRepository.Priorities.High)
  priority?: number

  @IsOptional()
  @IsNumber()
  executorId?: number

  @IsOptional()
  @IsNumber()
  assignerId?: number

  @IsOptional()
  @IsNumber()
  parentId?: number

  @IsOptional()
  @IsNumber()
  folderId?: number

  @IsOptional()
  @IsNumber()
  sprintId?: number

  @IsOptional()
  @IsArray()
  observers?: number[]

  @IsOptional()
  @IsArray()
  tags?: number[]
}
