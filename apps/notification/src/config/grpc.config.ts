import type { ConfigService } from '@nestjs/config'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { resolve } from 'path'
import { protobufPackage } from '@komisoft/deeptasker-contracts'

export function getGrpcConfig(
  configService: ConfigService
): MicroserviceOptions {
  return {
    transport: Transport.GRPC,
    options: {
      package: protobufPackage,
      protoPath: resolve(
        'node_modules/@komisoft/deeptasker-contracts/dist/proto/notifications.proto'
      ),
      url: configService.getOrThrow<string>('GRPC_URL')
    }
  }
}
