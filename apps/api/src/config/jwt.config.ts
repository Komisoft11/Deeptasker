import { ExtractJwt } from 'passport-jwt'
import type { Request } from 'express'

export function getJWTConfig() {
  return {
    jwtFromRequest: ExtractJwt.fromExtractors([
      (req: Request) => {
        let token = null
        if (req && req.cookies) {
          token = req.cookies['accessToken']
        }
        return token
      }
    ]),
    secretOrKey: process.env.JWT_SECRET_KEY,
    passReqToCallback: true
  }
}
