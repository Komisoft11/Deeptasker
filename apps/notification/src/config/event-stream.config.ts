import { ConfigService } from '@nestjs/config'

export function getEventStreamConfig() {
  return {
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => ({
      exchanges: [
        {
          name: configService.getOrThrow<string>('RABBITMQ_EVENTS_EXCHANGE'),
          type: 'fanout'
        }
      ],
      uri: configService.getOrThrow<string>('RABBITMQ_URI'),
      connectionInitOptions: { wait: true }
    })
  }
}
