import { AppModule } from './app.module'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { SwaggerModule } from '@nestjs/swagger'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import { I18nValidationExceptionFilter } from 'nestjs-i18n'
import { ConfigService } from '@nestjs/config'
import { getCorsConfig, getSwaggerConfig } from './config'

const shouldCompress = (req, res) => {
  if (req.headers['x-no-compression']) {
    return false
  }
  return compression.filter(req, res)
}

async function bootstrap() {
  const app: INestApplication = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)

  const isSwaggerEnabled = configService.getOrThrow<number>('SWAGGER') == 1

  if (isSwaggerEnabled) {
    const swaggerDocument = SwaggerModule.createDocument(app, getSwaggerConfig(), {
      deepScanRoutes: true
    })
    SwaggerModule.setup('swagger', app, swaggerDocument)
  }

  app.use(
    compression({
      filter: shouldCompress,
      threshold: 0
    })
  )

  app.use(cookieParser())

  app.use(cors(getCorsConfig()))
  app.use(express.json({ limit: '50mb' }))
  app.use(express.urlencoded({ limit: '50mb', extended: true }))

  app.useGlobalPipes(new ValidationPipe())
  app.useGlobalFilters(new I18nValidationExceptionFilter())

  app.use('/', express.static('./uploads/task-files'))

  const port = configService.getOrThrow<number>('PORT')

  await app.listen(port, () => {
    console.log(`Нест завелся на: ${port}`)
  })
}

bootstrap()
