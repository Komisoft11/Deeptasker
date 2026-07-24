import { ApiProperty } from '@nestjs/swagger'

export class RemoveExecutorResponse {
  @ApiProperty({
    description: 'Date time when the task executor was successfully removed',
    example: '2026-01-26T09:24:36.000Z'
  })
  reassignedAt: Date
}
