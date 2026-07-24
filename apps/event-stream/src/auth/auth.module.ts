import { Module } from '@nestjs/common'
import { JwtWsStrategy } from './strategies/jwt-ws.strategy'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { getJwtConfig, getPassportConfig } from '../config'

@Module({
  imports: [PassportModule.register(getPassportConfig()), JwtModule.registerAsync(getJwtConfig())],
  providers: [JwtWsStrategy],
  exports: [JwtModule, JwtWsStrategy]
})
export class AuthModule {}
