import { DocumentBuilder } from '@nestjs/swagger'

export function getSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle('Deeptasker')
    .setDescription('Deeptasker API description')
    .setVersion(process.env.npm_package_version ?? '1.0')
    .build()
}
