import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString, Min, MinLength } from "class-validator";

export class TaskFilterDto {
  @IsOptional()
  @IsString()
  statusId?: string;

  @IsOptional()
  @IsDateString()
  deadlineDate?: Date;

  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  description?: string

  @IsOptional()
  @IsNumber()
  @Min(1)
  executorId?: number

  @IsOptional()
  @IsNumber()
  @Min(1)
  assignerId?: number

  @IsOptional()
  @IsBoolean()
  isFinished?: boolean
}