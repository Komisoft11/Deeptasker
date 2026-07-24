import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { UserService } from '../../user/user.service'
import { JwtService } from '@nestjs/jwt'
import { ILoginResponse } from '../interfaces/login-response.interface'
import { RefreshTokenDto } from '../dto/refresh-token.dto'
import { RegisterDto } from '../dto/register.dto'
import { UserLoginDto } from '../dto/user-login.dto'
import * as crypto from 'crypto'
import { InjectMapper } from '@automapper/nestjs'
import type { Mapper } from '@automapper/core'
import dayjs from 'dayjs'
import { IJwtPayload } from '../interfaces/jwt-payload.interface'
import { IAccessToken } from '../interfaces/access-token.interface'
import { getExpiryDate } from '../utilities/token'
import { I18nContext, I18nService } from 'nestjs-i18n'
import { WorkspaceService } from '../../workspace/services/workspace/workspace.service'
import { ITokenPair } from '../interfaces/token-pair.interface'
import { RefreshModel } from '../models/refresh.model'
import { UserModel } from '../../user/models/user.model'
import { TransactionOrKnex } from 'objection'
import { MyBaseModel } from '../../common/database/base.model'
import { ConfigService } from '@nestjs/config'
import { compare } from '../utilities/password'
import { AUTH_REPOSITORY, IAuthRepository } from '../repositories/auth-repository.interface'
import { ChangePasswordDto } from '../dto/change-password.dto'
import { UserAlreadyRegisteredException } from '../../exceptions/entities/user/UserAlreadyRegisteredException'
import { UserDeletedException } from '../../exceptions/entities/user/UserDeletedException'
import { RegistrationVerificationService } from '../../verification/service/registration-verification.service'
import { PasswordResetVerificationService } from '../../verification/service/password-reset-verification.service'
import { ProjectService } from '../../project/services/project/project.service'
import { NotificationService } from '../../notification/notification.service'
import type { Lang } from '../../notification/types'
import { getCurrentUTCDateTime } from '../../common/helpers/date'

export interface ILoginResponseWithRefreshToken {
  refreshToken: string
  loginResponse: ILoginResponse
}

@Injectable()
export class AuthService {
  private readonly isProduction: boolean

  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectMapper()
    private readonly mapper: Mapper,
    private readonly i18n: I18nService,
    private readonly configService: ConfigService,
    private readonly workspaceService: WorkspaceService,
    private readonly projectService: ProjectService,
    private readonly registrationVerificationService: RegistrationVerificationService,
    private readonly passwordResetVerificationService: PasswordResetVerificationService,
    private readonly messagingService: NotificationService
  ) {
    this.isProduction = this.configService.getOrThrow<string>('NODE_ENV') === 'production'
  }

  public async login(userLoginDto: UserLoginDto): Promise<ILoginResponseWithRefreshToken> {
    const user = await this.userService.validateUser(userLoginDto)

    const tokens = await this.generateTokens(user)

    return { refreshToken: tokens.refreshToken, loginResponse: this.getLoginResponse(tokens, user) }
  }

  public async register(registerDto: RegisterDto): Promise<void> {
    const isUserRegistered = await this.userService.isUserRegistered(registerDto.email)

    if (isUserRegistered) {
      throw new UserAlreadyRegisteredException()
    }

    const deletedUser = await this.userService.getDeletedUserByEmail(registerDto.email)

    if (deletedUser) {
      throw new UserDeletedException()
    }

    const trx = await MyBaseModel.startTransaction()
    try {
      const username = await this.createDefaultUsername(registerDto.email)

      const user = await this.userService.create(
        {
          username: username,
          email: registerDto.email,
          password: registerDto.password,
          lastName: registerDto.lastName,
          firstName: registerDto.firstName,
          hasPoliciesAgreement: registerDto.hasPoliciesAgreement
        },
        !this.isProduction,
        trx
      )

      if (this.isProduction) {
        await this.requestVerificationCode(user, trx)
      }

      const workspace = await this.workspaceService.createDefault(user, trx)

      await this.projectService.createDefault(workspace, user, trx)

      await trx.commit()
    } catch (e) {
      await trx.rollback()
      console.error(e)
      throw e
    }
  }

  public async logout(user: UserModel): Promise<void> {
    await this.authRepository.logout(user)
  }

  public async refreshToken(refreshToken: string): Promise<ITokenPair> {
    if (!refreshToken) {
      throw new UnauthorizedException()
    }

    const token = await this.findRefreshToken(refreshToken)

    if (!token) {
      throw new UnauthorizedException({
        message: this.i18n.t('auth.security.refresh_token_not_found', {
          lang: I18nContext.current().lang
        })
      })
    }

    const user = await this.authRepository.getUser(token)

    return await this.generateTokens(user)
  }

  public async activate(user: UserModel, code: string): Promise<ILoginResponseWithRefreshToken> {
    const trx = await MyBaseModel.startTransaction()

    try {
      await this.verifyActivation(code, user, trx)

      const [tokens] = await Promise.all([
        this.generateTokens(user, trx),
        this.authRepository.activate(user, trx),
        this.deleteActivationCode(user, trx)
      ])

      await trx.commit()

      return {
        refreshToken: tokens.refreshToken,
        loginResponse: this.getLoginResponse(tokens, user)
      }
    } catch (e) {
      await trx.rollback()
      throw e
    }
  }

  public async getUserFromJwtPayload(payload: IJwtPayload): Promise<UserModel> {
    return await this.userService.getUser(payload.id)
  }

  public async updatePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<void> {
    const { password, newPassword } = changePasswordDto

    if (password === newPassword) {
      throw new ForbiddenException('Old password and new one are the same!')
    }

    const user = await UserModel.query().findById(userId)

    if (!user) {
      throw new ForbiddenException(
        this.i18n.t('user.not_found', { lang: I18nContext.current().lang })
      )
    }

    const passwordEquals: boolean = await compare(password, user.password)

    if (!passwordEquals) {
      throw new ForbiddenException('Incorrect password')
    }

    await this.authRepository.updatePassword(user, newPassword)

    await this.messagingService.publishNotification({
      type: 'PASSWORD_CHANGED',
      recipient: { email: user.email },
      payload: {
        date: getCurrentUTCDateTime()
      },
      lang: (I18nContext.current().lang as Lang) ?? 'ru'
    })
  }

  public async sendActivationCode(user: UserModel): Promise<void> {
    if (!(await this.canResendNewActivationCode(user))) {
      throw new ForbiddenException('Wait for 2 minutes')
    }

    const code = await this.createActivationCode(user)

    await this.messagingService.publishNotification({
      type: 'OTP_REQUESTED',
      recipient: {
        email: user.email
      },
      payload: {
        otpType: 'ACTIVATE_USER',
        code
      },
      lang: (I18nContext.current().lang as Lang) ?? 'ru'
    })
  }

  public async requestPasswordReset(user: UserModel): Promise<void> {
    if (!(await this.canResendNewResetCode(user))) {
      throw new ForbiddenException('Wait for 2 minutes')
    }

    const code = await this.createResetCode(user)

    await this.messagingService.publishNotification({
      type: 'OTP_REQUESTED',
      recipient: { email: user.email },
      payload: {
        otpType: 'RESET_PASSWORD',
        code
      },
      lang: (I18nContext.current().lang as Lang) ?? 'ru'
    })
  }

  public async verifyPasswordResetCode(code: string, user: UserModel): Promise<void> {
    await this.verifyReset(code, user)

    await this.logout(user)
  }

  public async resetPassword(code: string, password: string, user: UserModel): Promise<void> {
    const trx = await MyBaseModel.startTransaction()

    try {
      await this.verifyReset(code, user, trx)

      await Promise.all([
        this.deleteResetCode(user, trx),
        this.authRepository.resetPassword(user, password, trx)
      ])

      await trx.commit()
    } catch (e) {
      await trx.rollback()
      throw e
    }
  }

  public async requestVerificationCode(user: UserModel, trx?: TransactionOrKnex): Promise<void> {
    const code = await this.createActivationCode(user, trx)
    await this.messagingService.publishNotification({
      type: 'OTP_REQUESTED',
      recipient: {
        email: user.email
      },
      payload: {
        otpType: 'ACTIVATE_USER',
        code
      },
      lang: (I18nContext.current().lang as Lang) ?? 'ru'
    })
  }

  public isClientReferer(req: Request): boolean {
    return Boolean(
      req?.headers['referer']?.toString().includes(this.configService.get('CLIENT_URL'))
    )
  }

  private getLoginResponse(tokens: ITokenPair, user: UserModel): ILoginResponse {
    return {
      accessToken: tokens.accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        isActivated: user.isActivated,
        iconBg: user.iconBg,
        iconFg: user.iconFg,
        avatarId: user.avatarId
      }
    }
  }

  private async generateTokens(user: UserModel, trx?: TransactionOrKnex): Promise<ITokenPair> {
    const accessToken = this.createAccessToken(user)
    const refreshToken = await this.createRefreshToken(user, trx)

    return {
      accessToken: accessToken,
      refreshToken: refreshToken.token
    }
  }

  private async findRefreshToken(token: string): Promise<RefreshModel | null> {
    return this.authRepository.findRefreshToken(token)
  }

  private async generateToken(
    byteLength = 32,
    stringBase: BufferEncoding = 'hex'
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(byteLength, (err, buffer) => {
        if (err) {
          reject(err)
        } else {
          resolve(buffer.toString(stringBase))
        }
      })
    })
  }

  private async createRefreshToken(
    user: UserModel,
    trx?: TransactionOrKnex
  ): Promise<RefreshTokenDto> {
    const refreshToken = await this.generateToken()

    const em = await MyBaseModel.startTransaction(trx)
    try {
      const refresh = await this.authRepository.createRefreshToken(user, refreshToken, trx)

      await em.commit()

      return this.mapper.map(refresh, RefreshModel, RefreshTokenDto)
    } catch (e) {
      await em.rollback()
      throw e
    }
  }

  private createAccessToken(user: UserModel): IAccessToken {
    const createdAt = dayjs()
    const expiresIn = getExpiryDate(createdAt).toISOString()

    const payload: IJwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
      createdAt: createdAt.toISOString()
    }
    const token = this.jwtService.sign(payload)

    return {
      expiresIn,
      token
    }
  }

  private async createDefaultUsername(email: string): Promise<string> {
    const base = email.split('@')[0]
    let username: string = base

    let i = 1

    while (await this.authRepository.isUsernameExists(username)) {
      username = `${base}_${i}`
      i++
    }

    return username
  }

  private async createActivationCode(user: UserModel, trx?: TransactionOrKnex): Promise<string> {
    return this.registrationVerificationService.createVerificationCode(user, trx)
  }

  private async verifyActivation(
    code: string,
    user: UserModel,
    trx?: TransactionOrKnex
  ): Promise<void> {
    return this.registrationVerificationService.verifyVerificationCode(code, user, trx)
  }

  private async deleteActivationCode(user: UserModel, trx?: TransactionOrKnex) {
    return this.registrationVerificationService.deleteVerificationCode(user, trx)
  }

  private async canResendNewActivationCode(user: UserModel): Promise<boolean> {
    return this.registrationVerificationService.canResendNewVerificationCode(user)
  }

  private async canResendNewResetCode(user: UserModel): Promise<boolean> {
    return this.passwordResetVerificationService.canResendNewVerificationCode(user)
  }

  private async createResetCode(user: UserModel, trx?: TransactionOrKnex) {
    return this.passwordResetVerificationService.createVerificationCode(user, trx)
  }

  private async verifyReset(code: string, user: UserModel, trx?: TransactionOrKnex): Promise<void> {
    return this.passwordResetVerificationService.verifyVerificationCode(code, user, trx)
  }

  private async deleteResetCode(user: UserModel, trx?: TransactionOrKnex) {
    return this.passwordResetVerificationService.deleteVerificationCode(user, trx)
  }
}
