import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { getRabbitmqConfig } from '@/config'
import { getGrpcConfig } from './config/grpc.config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)

  const rabbitmqConfig = getRabbitmqConfig(configService)
  const grpcConfig = getGrpcConfig(configService)

  app.connectMicroservice(rabbitmqConfig)
  app.connectMicroservice(grpcConfig)

  await app.startAllMicroservices()
  console.log('Notification service is listening for messages...')
}
bootstrap()
