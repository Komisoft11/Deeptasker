import { ConfigService } from '@nestjs/config'

export function getRabbitConfig() {
  return {
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
      return {
        exchanges: [
          {
            name: configService.getOrThrow<string>('RABBITMQ_EVENTS_EXCHANGE'),
            type: 'fanout'
          }
        ],
        uri: configService.getOrThrow<string>('RABBITMQ_URI'),
        connectionInitOptions: { wait: false }
      }
    }
  }
}
