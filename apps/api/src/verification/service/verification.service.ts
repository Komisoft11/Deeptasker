import { ForbiddenException } from '@nestjs/common'
import { UserModel } from '../../user/models/user.model'
import { IVerificationRepository } from '../repositories/verification-repository.interface'
import { TransactionOrKnex } from 'objection'
import { VerificationModel } from '../models/verification.model'
import { compare } from '../../auth/utilities/password'
import { MyBaseModel } from '../../common/database/base.model'
import { getCurrentUTCDateTime } from '../../common/helpers/date'
import { generateVerificationCode } from '../utilites/code'

export abstract class AbstractVerificationService {
  static readonly verificationCodeTimeout: number = 2 * 60 * 1000 // 2min

  public abstract verificationRepository: IVerificationRepository

  public async createVerificationCode(user: UserModel, em?: TransactionOrKnex): Promise<string> {
    const trx = await MyBaseModel.startTransaction(em)

    try {
      const existingVerification = await this.verificationRepository.getVerification(user.id)

      if (existingVerification?.code) {
        await this.deleteVerificationCode(user, trx)
      }

      const code = generateVerificationCode()

      await this.verificationRepository.createVerification(code, user.id, trx)

      await trx.commit()

      return code
    } catch (e) {
      await trx.rollback()
      console.error(e)
      throw e
    }
  }

  public async deleteVerificationCode(user: UserModel, trx?: TransactionOrKnex): Promise<void> {
    await this.verificationRepository.deleteVerification(user.id, trx)
  }

  public async verifyVerificationCode(code: string, user: UserModel, trx?: TransactionOrKnex) {
    const verification = await this.verificationRepository.getVerification(user.id)

    if (!verification) {
      throw new ForbiddenException('Can not find verification code')
    }

    if (this.isExpired(verification)) {
      await this.deleteVerificationCode(user, trx)
      throw new ForbiddenException('Verification code is expired')
    }

    if (!(await this.isValid(code, verification.code))) {
      throw new ForbiddenException('Invalid verification code')
    }
  }

  public async canResendNewVerificationCode(user: UserModel) {
    const verification = await this.verificationRepository.getVerification(user.id)

    if (!verification) {
      return true
    }

    const pendingTime = this.getPendingTime(verification)

    return pendingTime <= getCurrentUTCDateTime()
  }

  private isExpired(verification: VerificationModel): boolean {
    return verification.dateExpire < getCurrentUTCDateTime()
  }

  private async isValid(code: string, hash: string): Promise<boolean> {
    return compare(code, hash)
  }

  private getPendingTime(verification: VerificationModel): Date {
    const pendingTime = verification.dateCreated
    pendingTime.setTime(pendingTime.getTime() + AbstractVerificationService.verificationCodeTimeout)
    return pendingTime
  }
}
