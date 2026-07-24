import { IsNotEmpty, MaxLength } from 'class-validator'

export class GenerateTitleRequest {
  @IsNotEmpty()
  @MaxLength(512)
  content: string
}
