import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-jwt'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { getExpiryDate } from '../utilities/token'
import dayjs from 'dayjs'
import { AuthService } from '../services/auth.service'
import { IJwtPayload } from '../interfaces/jwt-payload.interface'
import type { Request } from 'express'
import { I18nContext } from 'nestjs-i18n'
import { UserModel } from '../../user/models/user.model'
import { getJWTConfig } from '../../config'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super(getJWTConfig())
  }

  public async validate(req: Request, payload: IJwtPayload): Promise<UserModel> {
    const i18n = I18nContext.current()
    const expiryDate = getExpiryDate(dayjs(payload.createdAt))

    if (expiryDate.isBefore(dayjs())) {
      throw new UnauthorizedException(i18n.t('auth.security.token_expired'))
    }

    return this.authService.getUserFromJwtPayload(payload)
  }
}
