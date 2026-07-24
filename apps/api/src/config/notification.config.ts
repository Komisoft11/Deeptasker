import { ConfigModule, ConfigService } from '@nestjs/config'
import { Transport } from '@nestjs/microservices'
import { type ClientsModuleAsyncOptions } from '@nestjs/microservices/module/interfaces'
import { resolve } from 'path'
import { protobufPackage } from '@komisoft/deeptasker-contracts'

export const NOTIFICATION_SERVICE_RMQ = 'NOTIFICATION_SERVICE_RMQ'
export const NOTIFICATION_SERVICE_GRPC = 'NOTIFICATION_SERVICE_GRPC'

export function getNotificationConfig(): ClientsModuleAsyncOptions {
  return {
    clients: [
      {
        name: NOTIFICATION_SERVICE_RMQ,
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.getOrThrow<string>('RABBITMQ_URI')],
            queue: configService.getOrThrow<string>('RABBITMQ_QUEUE'),
            queueOptions: {
              durable: configService.getOrThrow<string>('RABBITMQ_QUEUE_DURABLE') === 'true'
            }
          }
        }),
        inject: [ConfigService]
      },
      {
        name: NOTIFICATION_SERVICE_GRPC,
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          name: 'NOTIFICATIONS_PACKAGE',
          transport: Transport.GRPC,
          options: {
            package: protobufPackage,
            protoPath: resolve(
              'node_modules/@komisoft/deeptasker-contracts/dist/proto/notifications.proto'
            ),
            url: configService.getOrThrow<string>('GRPC_URL')
          }
        }),
        inject: [ConfigService]
      }
    ],
    isGlobal: true
  }
}
