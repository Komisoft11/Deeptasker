import { ConfigService } from '@nestjs/config'

export function getEventsConfig() {
  return {
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      exchanges: [
        {
          name: configService.getOrThrow<string>('RABBITMQ_EVENTS_EXCHANGE'),
          type: 'fanout'
        }
      ],
      uri: configService.getOrThrow<string>('RABBITMQ_URI'),
      connectionInitOptions: { wait: false },
    })
  }
}
