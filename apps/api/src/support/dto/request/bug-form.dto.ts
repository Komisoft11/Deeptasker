import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsString, MaxLength } from 'class-validator'
import { LocationOption } from '../../type'
import { UploadedFileResponse } from '../../../task/dto'

type BugFormFile = Pick<UploadedFileResponse, 'id' | 'originalName' | 'filePath'>

type UserEnvironment = {
  userAgent: string
  platform: string
  screenResolution: string
  viewportSize: string
  browserLanguage: string
  timeZone: string
  url: string
  appVersion: string
  build: string
  featureFlags: { newDragDrop: boolean }
  consoleLogs: string[]
  errorStack: string
}

export class BugFormRequest {
  @ApiProperty({
    description: 'Brief summary of the bug or issue',
    example: 'Button not responding on click'
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  titleField: string

  @ApiProperty({
    description: 'Where in the application did the bug occur?',
    example: LocationOption.SETTINGS
  })
  @IsNotEmpty()
  location: LocationOption | string

  @ApiProperty({
    description: 'What actually happened when the bug occurred?',
    example: 'Clicking the Save button does nothing and no error message appears'
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(300)
  actual: string

  @ApiProperty({
    description: 'What did you expect to happen instead?',
    example: 'Settings should be saved and confirmation message should appear'
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(300)
  expected: string

  @ApiProperty({
    description: 'Array of uploaded file objects attached to the bug report',
    example: [
      {
        id: 42,
        originalName: 'bug-screenshot-1.png',
        filePath: '/uploads/bug-reports/42/bug-screenshot-1.png'
      },
      { id: 43, originalName: 'error-log.txt', filePath: '/uploads/bug-reports/42/error-log.txt' }
    ]
  })
  @IsArray()
  files: BugFormFile[]

  @ApiProperty({
    description:
      'Technical environment information about the user browser and system when the bug occurred. Helps in reproducing and debugging the issue.',
    example: {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_2_1)...',
      platform: 'MacIntel',
      screenResolution: '2560x1440',
      viewportSize: '1920x1080',
      browserLanguage: 'ru-RU',
      timeZone: 'Europe/Moscow',
      url: 'https://example.com/board',
      appVersion: '1.4.2',
      build: 'abc123def',
      featureFlags: { newDragDrop: true },
      consoleLogs: ["TypeError: Cannot read property 'x' of undefined"],
      errorStack: "TypeError: Cannot read property 'x' of undefined at ..."
    }
  })
  environment: UserEnvironment
}
