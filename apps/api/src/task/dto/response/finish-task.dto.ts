import { ApiProperty } from '@nestjs/swagger'

export class FinishTaskResponse {
  @ApiProperty({
    description: 'Date time when the user completed the task',
    example: '2026-01-26T09:24:36.000Z'
  })
  finishedAt: Date
}
