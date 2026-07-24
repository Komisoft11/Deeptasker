import { Controller, Get } from '@nestjs/common'

@Controller('health')
export class HealthController {
  constructor() {}

  @Get()
  public async health() {
    return 'Server is healthy!'
  }
}
