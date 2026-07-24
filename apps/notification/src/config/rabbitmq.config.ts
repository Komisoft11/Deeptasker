import { type ConfigService } from '@nestjs/config'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'

export function getRabbitmqConfig(
  configService: ConfigService
): MicroserviceOptions {
  return {
    transport: Transport.RMQ,
    options: {
      urls: [configService.getOrThrow<string>('RABBITMQ_URI')],
      queue: configService.getOrThrow<string>('RABBITMQ_QUEUE'),
      queueOptions: {
        durable:
          configService.getOrThrow<string>('RABBITMQ_QUEUE_DURABLE') === 'true'
      }
    }
  }
}
