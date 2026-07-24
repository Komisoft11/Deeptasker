import { ApiProperty } from '@nestjs/swagger'

export class GenerateReportResponse {
  @ApiProperty({
    description: 'Unique identifier of the generated report in the database',
    example: 10
  })
  id: number

  @ApiProperty({
    description:
      'UUID (Universally Unique Identifier) of the report for external references and secure sharing',
    example: 'f03d06dc-0719-4781-8293-58991791c09e'
  })
  uuid: string
}
