import { IsNotEmpty, IsNumber } from 'class-validator'

export class CommonTimestampDto {
  @IsNotEmpty()
  @IsNumber()
  timestamp: number
}
