import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { GlobalRole } from './access/enum.role'
import { I18nContext, I18nService } from 'nestjs-i18n'
import { compare } from '../auth/utilities/password'
import { UserModel } from './models/user.model'
import { TransactionOrKnex } from 'objection'
import { UserLoginDto } from '../auth/dto/user-login.dto'
import { cleanUndefined } from '../common/helpers/objects'
import { CreateUserDto } from './dto/in/create-user.dto'
import { UpdateUserDto } from './dto/in/update-user.dto'
import { UpdateUserRoleDto } from './dto/in/update-user-role.dto'
import { UpdateUserEmailDto } from './dto/in/update-user-email.dto'
import { FileModel } from '../file/models/file.model'
import { VerifyUserEmailDto } from './dto/in/verify-user-email.dto'
import {
  IPendingEmailUpdatesRepository,
  PENDING_EMAIL_UPDATES_REPOSITORY
} from './repositories/pending-email-updates/pending-email-updates-repository.interface'
import { MyBaseModel } from '../common/database/base.model'
import { DeleteUserDto } from './dto/in/delete-user.dto'
import { AuthService } from '../auth/services/auth.service'
import { IUserRepository, USER_REPOSITORY } from './repositories/user/user-repository.interface'
import { CheckUsernameDto } from './dto/in/check-username.dto'
import { UserDeletedException } from '../exceptions/entities/user/UserDeletedException'
import { UserNotFoundException } from '../exceptions/entities/user/UserNotFoundException'
import { UserNotActivatedException } from '../exceptions/entities/user/UserNotActivatedException'
import { ConfigService } from '@nestjs/config'
import { IncorrectEmailOrPasswordException } from '../exceptions/entities/auth/IncorrectEmailOrPasswordException'
import { EmailChangeVerificationService } from '../verification/service/email-change-verification.service'
import { DeleteUserVerificationService } from '../verification/service/delete-user-verification.service'
import { NotificationService } from '../notification/notification.service'
import { getCurrentUTCDateTime } from '../common/helpers/date'
import { PoliciesService } from '../policies/policies.service'
import type { Lang } from '../notification/types'

@Injectable()
export class UserService {
  private readonly isProduction: boolean

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PENDING_EMAIL_UPDATES_REPOSITORY)
    private readonly pendingEmailUpdatesRepository: IPendingEmailUpdatesRepository,
    private i18n: I18nService,
    @Inject(forwardRef(() => AuthService)) private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly emailChangeVerificationService: EmailChangeVerificationService,
    private readonly deleteUserVerificationService: DeleteUserVerificationService,
    private readonly policiesService: PoliciesService,
    private readonly messagingService: NotificationService
  ) {
    this.isProduction = this.configService.get('NODE_ENV') === 'production'
  }

  public async create(
    dto: CreateUserDto,
    isActivated: boolean,
    trx: TransactionOrKnex
  ): Promise<UserModel> {
    const user = await this.userRepository.createUser(dto, isActivated, trx)

    if (!dto.hasPoliciesAgreement) {
      throw new ForbiddenException('Can not create user without policies agreement')
    }

    await this.policiesService.agreeWithPolitics(
      { user: user, agreeDate: getCurrentUTCDateTime() },
      trx
    )

    return user
  }

  public async getUser(id: number, trx?: TransactionOrKnex): Promise<UserModel> {
    const user = await this.userRepository.getUser(id, trx)

    if (!user) {
      throw new NotFoundException(
        this.i18n.t('user.not_found', { lang: I18nContext.current().lang })
      )
    }

    return user
  }

  public async findNotInProject(query: string, excludeProjectId: number): Promise<UserModel[]> {
    return this.userRepository.findNotInProject(query, excludeProjectId)
  }

  public async findNotInWorkspaceAdminsAndInvitees(
    query: string,
    excludeWorkspaceAdminsId: number,
    excludeWorkspaceInviteesId: number
  ): Promise<UserModel[]> {
    return this.userRepository.findNotInWorkspaceAdminsAndInvitees(
      query,
      excludeWorkspaceAdminsId,
      excludeWorkspaceInviteesId
    )
  }

  public async findNotInWorkspaceAdmins(
    query: string,
    excludeWorkspaceAdminsId: number
  ): Promise<UserModel[]> {
    return this.userRepository.findNotInWorkspaceAdmins(query, excludeWorkspaceAdminsId)
  }

  public async findNotInWorkspaceInvitees(
    query: string,
    excludeWorkspaceInviteesId: number
  ): Promise<UserModel[]> {
    return this.userRepository.findNotInWorkspaceInvitees(query, excludeWorkspaceInviteesId)
  }

  public async findInProject(query: string, projectId: number): Promise<UserModel[]> {
    return this.userRepository.findInProject(query, projectId)
  }

  public async find(query: string): Promise<UserModel[]> {
    return this.userRepository.getFindBaseUserFindQuery(query)
  }

  public async getAll(): Promise<UserModel[]> {
    return await this.userRepository.getAll()
  }

  public async deleteRequest(user: UserModel): Promise<void> {
    if (!(await this.canResendNewConfirmationCodeDeleteAccount(user))) {
      throw new ForbiddenException('Wait for 2 minutes')
    }

    const code = await this.createConfirmationCodeDeleteAccount(user)

    await this.messagingService.publishNotification({
      type: 'OTP_REQUESTED',
      recipient: { email: user.email },
      payload: { otpType: 'DELETE_ACCOUNT', code },
      lang: (I18nContext.current().lang as Lang) ?? 'ru'
    })
  }

  public async delete(deleteUserDto: DeleteUserDto, user: UserModel): Promise<void> {
    if (!deleteUserDto.code && !deleteUserDto.password) {
      throw new BadRequestException('Cannot delete user')
    }

    if (deleteUserDto.code) {
      await this.deleteAccountByCode(user, deleteUserDto.code)
    } else if (deleteUserDto.password) {
      await this.deleteAccountByPassword(user, deleteUserDto.password)
    }

    await Promise.all([
      this.authService.logout(user),
      this.messagingService.publishNotification({
        type: 'ACCOUNT_DELETED',
        recipient: { email: user.email },
        payload: { date: getCurrentUTCDateTime() },
        lang: (I18nContext.current().lang as Lang) ?? 'ru'
      })
    ])
  }

  public async validateUser(userLoginDto: UserLoginDto): Promise<UserModel> {
    const isUserRegistered = await this.isUserRegistered(userLoginDto.email)

    if (!isUserRegistered) {
      const deletedUser = await this.userRepository.getDeletedUserByEmail(userLoginDto.email)

      if (deletedUser) {
        throw new UserDeletedException()
      }

      throw new UserNotFoundException()
    }

    const user = await this.getUserByEmail(userLoginDto.email)

    if (!user.isActivated) {
      if (this.isProduction) {
        await this.authService.requestVerificationCode(user)
      }

      throw new UserNotActivatedException()
    }

    const passwordEquals = await compare(userLoginDto.password, user.password)

    if (!passwordEquals) {
      throw new IncorrectEmailOrPasswordException()
    }

    return user
  }

  public async getUserByEmail(email: string): Promise<UserModel> {
    const user = await this.userRepository.getUserByEmail(email)

    if (!user) {
      throw new NotFoundException({
        message: this.i18n.t('user.not_found', {
          lang: I18nContext.current().lang
        })
      })
    }

    return user
  }

  public async isUserRegistered(email: string): Promise<boolean> {
    const user = await this.userRepository.getUserByEmail(email)

    return Boolean(user?.id)
  }

  public async getDeletedUserByEmail(email: string): Promise<UserModel | null> {
    return this.userRepository.getDeletedUserByEmail(email)
  }

  public async changeRole(userId: number, dto: UpdateUserRoleDto): Promise<void> {
    const user = await this.getUser(userId)

    if (!user) {
      throw new UserNotFoundException()
    }

    let role = dto.role.toLowerCase()
    role = role == GlobalRole.Admin || role == GlobalRole.User ? role : null

    if (!role) {
      return
    }

    return this.userRepository.updateUser(user, dto)
  }

  public async updateUserInfo(
    userId: number,
    updateUserDto: UpdateUserDto,
    trx?: TransactionOrKnex
  ): Promise<void> {
    const user = await this.getUser(userId)

    await this.userRepository.updateUser(
      user,
      cleanUndefined({
        firstName: updateUserDto.firstName,
        lastName: updateUserDto.lastName,
        middleName: updateUserDto.middleName,
        username: updateUserDto.username,
        sex: updateUserDto.sex,
        dob: updateUserDto.dob,
        description: updateUserDto.description,
        phoneNumber: updateUserDto.phoneNumber,
        activeTaskId: updateUserDto.activeTaskId
      }),
      trx
    )
  }

  public async getByIds(ids: number[]): Promise<UserModel[]> {
    return this.userRepository.getByIds(ids)
  }

  public async updateProfileAvatar(
    user: UserModel,
    uploadedFile: FileModel,
    trx?: TransactionOrKnex
  ): Promise<void> {
    await this.userRepository.updateProfileAvatar(user, uploadedFile, trx)
  }

  public async removeProfileAvatar(user: UserModel, trx: TransactionOrKnex): Promise<void> {
    await this.userRepository.removeProfileAvatar(user, trx)
  }

  public async requestUpdateEmail(
    user: UserModel,
    updateUserEmailDto: UpdateUserEmailDto
  ): Promise<void> {
    const userByPreviousEmail = await this.userRepository.getUserByEmail(user.email)

    if (!userByPreviousEmail) {
      throw new ForbiddenException('Previous email is not exist')
    }

    const userByCurrentEmail = await this.userRepository.getUserByEmail(updateUserEmailDto.email)

    if (userByCurrentEmail) {
      throw new ForbiddenException('Email is already in exist')
    }

    const isEmailAlreadyPending = await this.pendingEmailUpdatesRepository.isEmailAlreadyPending(
      updateUserEmailDto.email
    )

    if (isEmailAlreadyPending) {
      throw new ForbiddenException('Email is already in exist')
    }

    const trx = await MyBaseModel.startTransaction()

    try {
      const [code] = await Promise.all([
        this.createChangeEmailConfirmationCode(user, trx),
        this.pendingEmailUpdatesRepository.createEmailPending(updateUserEmailDto.email, user, trx)
      ])

      await trx.commit()

      await this.sendRequestUpdateEmail(user.email, updateUserEmailDto.email, code)
    } catch (e) {
      await trx.rollback()
      console.error(e)
      throw e
    }
  }

  public async resendRequestUpdateEmail(user: UserModel): Promise<void> {
    if (!(await this.canResendNewChangeEmailConfirmationCode(user))) {
      throw new ForbiddenException('Wait for 2 minutes')
    }

    const pending = await this.pendingEmailUpdatesRepository.getPendingEmailByUser(user)

    if (!pending) {
      throw new BadRequestException('Can not find pending email')
    }

    const code = await this.createChangeEmailConfirmationCode(user)

    await this.sendRequestUpdateEmail(user.email, pending.email, code)
  }

  private async sendRequestUpdateEmail(
    email: string,
    pendingEmail: string,
    code: string
  ): Promise<void> {
    const lang = (I18nContext.current().lang as Lang) ?? 'ru'
    await Promise.all([
      this.messagingService.publishNotification({
        type: 'OTP_REQUESTED',
        recipient: {
          email: pendingEmail
        },
        payload: {
          otpType: 'CHANGE_EMAIL',
          code
        },
        lang
      }),
      this.messagingService.publishNotification({
        type: 'EMAIL_CHANGE_PROCESSING',
        recipient: {
          email
        },
        payload: {
          newEmail: pendingEmail
        },
        lang
      })
    ])
  }

  public async confirmNewEmail(user: UserModel, verifyUserEmailDto: VerifyUserEmailDto) {
    const pending = await this.pendingEmailUpdatesRepository.getPendingEmailByUser(user)

    const trx = await MyBaseModel.startTransaction()

    const previousEmail = user.email
    const pendingEmail = pending.email

    try {
      await this.verifyChangeEmailConfirmationCode(verifyUserEmailDto.code, user, trx)

      await this.userRepository.updateUser(
        user,
        {
          email: pendingEmail
        },
        trx
      )

      await Promise.all([
        this.pendingEmailUpdatesRepository.deletePendingEmailByUser(user, pendingEmail, trx),
        this.deleteChangeEmailConfirmationCode(user, trx),
        this.messagingService.publishNotification({
          type: 'EMAIL_CHANGE_COMPLETED',
          recipient: {
            emails: [previousEmail, pendingEmail]
          },
          payload: {
            newEmail: pendingEmail
          },
          lang: (I18nContext.current().lang as Lang) ?? 'ru'
        })
      ])

      await trx.commit()
    } catch (e) {
      await trx.rollback()
      console.error(e)
      throw e
    }
  }

  public async cancelUpdateEmail(user: UserModel): Promise<void> {
    const pendingEmailUpdate = await this.pendingEmailUpdatesRepository.getPendingEmailByUser(user)

    if (!pendingEmailUpdate) {
      throw new ForbiddenException('Nothing to cancel')
    }

    const trx = await MyBaseModel.startTransaction()

    try {
      await this.pendingEmailUpdatesRepository.deletePendingEmailByUser(
        user,
        pendingEmailUpdate.email,
        trx
      )

      await this.deleteChangeEmailConfirmationCode(user, trx)

      await trx.commit()
    } catch (e) {
      await trx.rollback()
      console.error(e)
      throw e
    }
  }

  public async isUserExists(userId: number): Promise<boolean> {
    return this.userRepository.isUserExists(userId)
  }

  public async isUsernameAvailable(
    checkUsernameDto: CheckUsernameDto,
    user: UserModel
  ): Promise<boolean> {
    if (user.username === checkUsernameDto.username) {
      return false
    }

    return this.userRepository.isUsernameAvailable(checkUsernameDto.username)
  }

  private async deleteAccountByCode(user: UserModel, code: string): Promise<void> {
    const trx = await MyBaseModel.startTransaction()

    try {
      await this.verifyConfirmationCodeDeleteAccount(code, user, trx)

      await Promise.all([
        this.userRepository.deleteUser(user, trx),
        this.deleteConfirmationCodeDeleteAccount(user, trx)
      ])

      await trx.commit()
    } catch (e) {
      await trx.rollback()
      console.error(e)
      throw e
    }
  }

  private async deleteAccountByPassword(user: UserModel, password: string) {
    const passwordEquals = await compare(password, user.password)

    if (!passwordEquals) {
      throw new ForbiddenException('Incorrect password')
    }

    await this.userRepository.deleteUser(user)
  }

  private async createChangeEmailConfirmationCode(
    user: UserModel,
    trx?: TransactionOrKnex
  ): Promise<string> {
    return this.emailChangeVerificationService.createVerificationCode(user, trx)
  }

  private async verifyChangeEmailConfirmationCode(
    code: string,
    user: UserModel,
    trx?: TransactionOrKnex
  ): Promise<void> {
    return this.emailChangeVerificationService.verifyVerificationCode(code, user, trx)
  }

  private async canResendNewChangeEmailConfirmationCode(user: UserModel): Promise<boolean> {
    return this.emailChangeVerificationService.canResendNewVerificationCode(user)
  }

  private async deleteChangeEmailConfirmationCode(user: UserModel, trx?: TransactionOrKnex) {
    return this.emailChangeVerificationService.deleteVerificationCode(user, trx)
  }

  private async createConfirmationCodeDeleteAccount(
    user: UserModel,
    trx?: TransactionOrKnex
  ): Promise<string> {
    return this.deleteUserVerificationService.createVerificationCode(user, trx)
  }

  private async verifyConfirmationCodeDeleteAccount(
    code: string,
    user: UserModel,
    trx?: TransactionOrKnex
  ): Promise<void> {
    return this.deleteUserVerificationService.verifyVerificationCode(code, user, trx)
  }

  private async canResendNewConfirmationCodeDeleteAccount(user: UserModel): Promise<boolean> {
    return this.deleteUserVerificationService.canResendNewVerificationCode(user)
  }

  private async deleteConfirmationCodeDeleteAccount(
    user: UserModel,
    trx?: TransactionOrKnex
  ): Promise<void> {
    return this.deleteUserVerificationService.deleteVerificationCode(user, trx)
  }
}
