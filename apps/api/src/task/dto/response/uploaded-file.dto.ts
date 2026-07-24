import { AutoMap } from '@automapper/classes'
import { ApiProperty } from '@nestjs/swagger'

export class UploadedFileResponse {
  @ApiProperty({
    description: 'Unique identifier of the uploaded file',
    example: 42
  })
  @AutoMap()
  id: number

  @ApiProperty({
    description: 'Original filename as it was uploaded',
    example: 'bug-screenshot-2024-03-15.png'
  })
  @AutoMap()
  originalName: string

  @ApiProperty({
    description: 'Path where the file is stored on the server',
    example: '/uploads/bug-reports/42/bug-screenshot-2024-03-15.png'
  })
  @AutoMap()
  filePath: string

  @ApiProperty({
    description: 'File size in bytes',
    example: 1048576
  })
  @AutoMap()
  size: number

  @ApiProperty({
    description: 'Date and time when the file was uploaded',
    example: '2024-03-15T10:30:00Z'
  })
  @AutoMap()
  dateCreated: Date
}
