import { ConfigModule, ConfigService } from '@nestjs/config'

export function getJwtConfig() {
  return {
    imports: [ConfigModule],
    useFactory: async (config: ConfigService) => ({
      secret: config.getOrThrow<string>('JWT_SECRET_KEY'),
      signOptions: {
        expiresIn: config.getOrThrow<string>('JWT_EXPIRES_IN')
      }
    }),
    inject: [ConfigService]
  }
}
