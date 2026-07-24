import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { WsException } from '@nestjs/websockets'
import { getExpiryDate } from '../utils/token'
import * as dayjs from 'dayjs'
import { IJwtPayload } from '../interfaces/jwt-payload.interface'
import { Request } from 'express'
import { IncomingMessage } from 'http'
import { JwtService } from '@nestjs/jwt'
import { getCookieValue } from '../../common/helpers/cookie.helper'

@Injectable()
export class JwtWsStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly jwt: JwtService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          let token = null
          if (req && req.cookies) {
            token = req.cookies['accessToken']
          }
          return token
        }
      ]),
      secretOrKey: process.env.JWT_SECRET_KEY
    })
  }

  private getAccessToken(message: IncomingMessage): string {
    const accessToken = getCookieValue(message?.headers?.cookie, 'accessToken')
    if (!accessToken) {
      throw new WsException('Access token not provided')
    }
    return accessToken
  }

  private getPayload(accessToken: string): IJwtPayload {
    return this.jwt.verify(accessToken)
  }

  private validate(payload: IJwtPayload): void {
    const expiryDate = getExpiryDate(dayjs(payload.createdAt))
    if (expiryDate.isBefore(dayjs())) {
      throw new WsException('Token expired')
    }
  }

  public getPayloadFromIncomingMessage(message: IncomingMessage): IJwtPayload {
    const accessToken = this.getAccessToken(message)

    const payload = this.getPayload(accessToken)

    this.validate(payload)

    return payload
  }
}
