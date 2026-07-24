import { ConfigModule, ConfigService } from '@nestjs/config'
import { Queues } from '../async-job/const'

export function getBullConfig() {
  return {
    imports: [ConfigModule],
    useFactory: async (config: ConfigService) => ({
      redis: {
        host: config.getOrThrow('REDIS_HOST'),
        port: config.getOrThrow('REDIS_PORT'),
        retryAttempts: 10
      }
    }),
    inject: [ConfigService]
  }
}

export function getBullQueues() {
  return [
    {
      name: Queues.EMAIL_QUEUE
    },
    {
      name: Queues.TRELLO_QUEUE
    },
    {
      name: Queues.PROJECT_ORDER_QUEUE
    },
    {
      name: Queues.TASK_ORDER_QUEUE
    },
    {
      name: Queues.REPORT_QUEUE
    }
  ]
}
