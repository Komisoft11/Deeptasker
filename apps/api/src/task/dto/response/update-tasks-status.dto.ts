import { ApiProperty } from '@nestjs/swagger'

export class UpdateTasksStatusResponse {
  @ApiProperty({
    description: 'Date time when the user move tasks from one status to another',
    example: '2026-01-26T09:24:36.000Z'
  })
  updatedAt: Date
}
